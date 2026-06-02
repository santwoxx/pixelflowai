import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-server";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { getMercadoPagoHeaders } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      // Body might be empty in some GET/IPN redirects
    }

    const { searchParams } = new URL(req.url);
    
    // Extract ID and Type from body (Webhook) or searchParams (IPN)
    const id = body.data?.id || body.id || searchParams.get("id") || searchParams.get("data.id");
    const type = body.type || body.action || searchParams.get("topic") || searchParams.get("type");

    console.log(`[Mercado Pago Webhook Received] ID: ${id}, Type: ${type}`);

    if (!id || !type) {
      return NextResponse.json({ success: true, message: "Webhook ping received, but no valid resource ID or type found." });
    }

    // 1. Prevent duplicate processing
    if (!db) {
      return NextResponse.json({ error: "Banco de dados indisponível." }, { status: 500 });
    }

    const webhookId = `mp_webhook_${id}`;
    const processedRef = doc(db, "processed_webhooks", webhookId);
    
    try {
      const processedSnap = await getDoc(processedRef);
      if (processedSnap.exists()) {
        console.log(`[Mercado Pago Webhook] Webhook ID ${webhookId} has already been processed.`);
        return NextResponse.json({ success: true, duplicated: true, message: "Webhook already processed." });
      }
    } catch (dbError) {
      console.warn("Could not check duplicate webhooks from block, proceeding:", dbError);
    }

    let verified = false;
    let externalRefUserId = "";
    let tier = "pro";
    let status = "pending";

    // 2. Fetch the actual resource status from Mercado Pago APIs (Double verification)
    if (type === "preapproval" || type === "subscription" || String(id).startsWith("pre")) {
      // Is a Subscription
      try {
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/preapproval/${id}`, {
          method: "GET",
          headers: getMercadoPagoHeaders(),
        });

        if (mpResponse.ok) {
          const preapprovalData = await mpResponse.json();
          status = preapprovalData.status;
          externalRefUserId = preapprovalData.external_reference || "";

          if (status === "authorized" || status === "active") {
            verified = true;
            
            // Map plan ID to correct tier
            const planId = preapprovalData.preapproval_plan_id;
            if (planId === "38092dc79d2440ac8ffba85282893b4a") {
              tier = "business";
            } else {
              tier = "pro";
            }
          } else if (status === "cancelled" || status === "paused") {
            // Handle cancellation immediately
            if (externalRefUserId) {
              const userRef = doc(db, "users", externalRefUserId);
              await updateDoc(userRef, {
                plan: "FREE",
                subscriptionTier: "free",
                subscriptionStatus: "cancelled",
                subscriptionId: String(id),
                credits: 0,
                updatedAt: serverTimestamp()
              });
              
              await setDoc(processedRef, {
                processedAt: new Date().toISOString(),
                id: String(id),
                type,
                userId: externalRefUserId,
                status: "cancelled",
                plan: "FREE"
              });

              console.log(`[Mercado Pago Webhook Cancelled Successful] User: ${externalRefUserId} degraded to FREE plan.`);
              return NextResponse.json({ success: true, processed: true, cancelled: true });
            }
          }
          console.log(`[Webhook Preapproval Status] ${status} for user ${externalRefUserId}, tier ${tier}`);
        } else {
          console.error("Failed to query Preapproval API on Mercado Pago:", await mpResponse.text());
        }
      } catch (err) {
        console.error("Error communicating with Mercado Pago Preapproval API:", err);
      }
    } else {
      // Is a normal Payment
      try {
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
          method: "GET",
          headers: getMercadoPagoHeaders(),
        });

        if (mpResponse.ok) {
          const paymentData = await mpResponse.json();
          status = paymentData.status;

          if (status === "approved" || status === "authorized") {
            verified = true;
            externalRefUserId = paymentData.external_reference || "";
            
            // Extract tier from metadata or description
            const itemDescription = paymentData.description || "";
            const metadataTier = paymentData.metadata?.tier;
            
            if (metadataTier === "business" || itemDescription.toLowerCase().includes("business") || itemDescription.toLowerCase().includes("corporativo")) {
              tier = "business";
            } else {
              tier = "pro";
            }
          } else if (status === "refunded" || status === "charged_back" || status === "cancelled") {
            externalRefUserId = paymentData.external_reference || "";
            if (externalRefUserId) {
              const userRef = doc(db, "users", externalRefUserId);
              await updateDoc(userRef, {
                plan: "FREE",
                subscriptionTier: "free",
                subscriptionStatus: "cancelled",
                credits: 0,
                updatedAt: serverTimestamp()
              });

              await setDoc(processedRef, {
                processedAt: new Date().toISOString(),
                id: String(id),
                type,
                userId: externalRefUserId,
                status: "degraded",
                plan: "FREE"
              });
              console.log(`[Mercado Pago Webhook Refunded] User: ${externalRefUserId} has been degraded.`);
              return NextResponse.json({ success: true, processed: true, degraded: true });
            }
          }
          console.log(`[Webhook Payment Status] ${status} for user ${externalRefUserId}, tier ${tier}`);
        } else {
          console.error("Failed to query Payment API on Mercado Pago:", await mpResponse.text());
        }
      } catch (err) {
        console.error("Error communicating with Mercado Pago Payment API:", err);
      }
    }

    if (!verified || !externalRefUserId) {
      console.warn(`[Mercado Pago Webhook] Webhook received for ID ${id} but could not verify or match user ID.`);
      return NextResponse.json({ success: true, message: "Ignored or unverified notification." });
    }

    // 3. Update the client subscription and balance in Firestore
    const userRef = doc(db, "users", externalRefUserId);
    const subId = `sub_mp_auto_${id}`;
    const subRef = doc(db, "subscriptions", subId);

    const mappedPlan = tier === "business" ? "CORPORATIVO" : "PROFISSIONAL";

    await setDoc(subRef, {
      userId: externalRefUserId,
      stripeSubscriptionId: String(id),
      tier: tier,
      plan: mappedPlan,
      status: "active",
      createdAt: new Date().toISOString()
    });

    await updateDoc(userRef, {
      plan: mappedPlan,
      subscriptionTier: tier,
      subscriptionStatus: "active",
      subscriptionId: String(id),
      credits: 999999, // Unlimited credits for paid subscriptions
      updatedAt: serverTimestamp()
    });

    // Save webhook as processed successfully
    await setDoc(processedRef, {
      processedAt: new Date().toISOString(),
      id: String(id),
      type,
      userId: externalRefUserId,
      tier,
      plan: mappedPlan,
      status: "active"
    });

    console.log(`[Mercado Pago Webhook Upgraded User Successful] User: ${externalRefUserId}, Plan: ${mappedPlan}, WebhookProcessedId: ${webhookId}`);
    return NextResponse.json({ success: true, processed: true, tier });

  } catch (err: any) {
    console.error("Mercado Pago Webhook Error:", err);
    return NextResponse.json({ error: err.message || "Webhook processing internal failure." }, { status: 500 });
  }
}

// Support GET for testing/IPN setups
export async function GET(req: NextRequest) {
  return POST(req);
}
