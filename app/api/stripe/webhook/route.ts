import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { db } from '@/lib/firebase-server';
import { doc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !sig || !webhookSecret) {
    try {
      const bodyText = await req.text();
      const event = JSON.parse(bodyText);
      console.log(`[Stripe Sim Webhook] Event: ${event.type}`);
      return NextResponse.json({ received: true, simulated: true });
    } catch {
      return new NextResponse("No stripe secret keys initialized", { status: 400 });
    }
  }

  let event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.client_reference_id;
      
      if (userId && db) {
        const userRef = doc(db, 'users', userId);
        const subId = 'sub_' + Math.random().toString(36).substring(2, 11);
        const subRef = doc(db, 'subscriptions', subId);

        await setDoc(subRef, {
          userId,
          stripeSubscriptionId: session.subscription?.toString() || 'mock_sub',
          tier: 'pro',
          status: 'active',
          createdAt: new Date().toISOString()
        });

        await updateDoc(userRef, {
          subscriptionTier: 'pro',
          credits: increment(1200),
          updatedAt: serverTimestamp()
        });

        console.log(`[Stripe Webhook Success] Processed upgrade tier for user ${userId}`);
      }
    }
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Error processing Stripe webhook details:", err);
    return new NextResponse("Database sync error", { status: 500 });
  }
}
