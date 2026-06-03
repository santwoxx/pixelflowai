import { NextRequest, NextResponse } from "next/server";
import { db, admin } from "@/lib/firebase-server";
import { getMercadoPagoHeaders } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const { userId, tier, paymentId, status } = await req.json();

    if (!userId || !tier) {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
    }

    let verified = false;
    let externalRefUserId = userId;

    if (paymentId && paymentId !== "mock_payment") {
      // Check if it is a preapproval subscription or has approved/authorized status
      if (paymentId.startsWith("preapproval") || paymentId.startsWith("pre") || status === "approved" || status === "authorized" || status === "active") {
        verified = true;
      } else {
        try {
          const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: "GET",
            headers: getMercadoPagoHeaders(),
          });

          if (mpResponse.ok) {
            const paymentData = await mpResponse.json();
            const paymentStatus = paymentData.status;
            
            if (paymentStatus === "approved" || paymentStatus === "authorized" || paymentStatus === "in_process" || paymentStatus === "active") {
              verified = true;
              // Retrieve matched user id
              externalRefUserId = paymentData.external_reference || userId;
            } else {
              console.warn(`Payment status returned is ${paymentStatus}, not approved.`);
            }
          } else {
            console.error("Failed to fetch payment details from Mercado Pago API:", await mpResponse.text());
            // Fallback if APIs are throttled or keys are in test limits but webhook had query params:
            if (status === "approved" || status === "authorized" || status === "active" || status === "pending") {
              verified = true;
            }
          }
        } catch (e) {
          console.error("Error calling Mercado Pago API for payment verification, falling back to params verification:", e);
          if (status === "approved" || status === "authorized" || status === "active" || status === "pending") {
            verified = true;
          }
        }
      }
    } else {
      // Manual mock approval (e.g. sandbox demo mode)
      if (status === "approved" || status === "mock_approved" || status === "authorized" || status === "active") {
        verified = true;
      }
    }

    if (!verified) {
      return NextResponse.json({ error: "Pagamento não confirmado ou não aprovado." }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: "Banco de dados indisponível." }, { status: 500 });
    }

    const userRef = db.collection("users").doc(externalRefUserId);
    const subId = "sub_mp_" + Math.random().toString(36).substring(2, 11);
    const subRef = db.collection("subscriptions").doc(subId);

    const mappedPlan = tier === "business" ? "CORPORATIVO" : "PROFISSIONAL";

    await subRef.set({
      userId: externalRefUserId,
      stripeSubscriptionId: paymentId || "mp_payment_mock",
      tier: tier,
      plan: mappedPlan,
      status: "active",
      createdAt: new Date().toISOString()
    });

    await userRef.update({
      plan: mappedPlan,
      subscriptionTier: tier,
      subscriptionStatus: "active",
      subscriptionId: paymentId || "mp_payment_mock",
      credits: 999999, // Unlimited credits
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`[Mercado Pago Success] Upgraded user ${externalRefUserId} to ${tier} with 999999 credits.`);
    return NextResponse.json({ success: true, tier });

  } catch (err: any) {
    console.error("Mercado Pago Verification Route Error:", err);
    return NextResponse.json({ error: err.message || "Erro de validação interna." }, { status: 500 });
  }
}
