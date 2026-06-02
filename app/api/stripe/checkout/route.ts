import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { userId, email, tier } = await req.json();
    if (!userId || !tier) {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      // SIMULATOR MODE for sandbox checks
      const mockSessionId = 'cs_test_' + Math.random().toString(36).substring(2, 15);
      return NextResponse.json({
        id: mockSessionId,
        url: `/checkout-success?userId=${userId}&tier=${tier}&session_id=${mockSessionId}`,
        simulated: true
      });
    }

    let priceId = '';
    if (tier === 'pro') {
      priceId = process.env.STRIPE_PRICE_PRO || 'price_mock_pro_123';
    } else if (tier === 'business') {
      priceId = process.env.STRIPE_PRICE_BUSINESS || 'price_mock_business_123';
    }

    const domain = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      customer_email: email,
      client_reference_id: userId,
      success_url: `${domain}/checkout-success?session_id={CHECKOUT_SESSION_ID}&userId=${userId}&tier=${tier}`,
      cancel_url: `${domain}/?tier-cancel=true`,
    });

    return NextResponse.json({ id: session.id, url: session.url, simulated: false });

  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json({ error: err.message || "Erro no Stripe gateway." }, { status: 500 });
  }
}
