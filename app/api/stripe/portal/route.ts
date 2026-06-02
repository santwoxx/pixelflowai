import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({
        url: '/app?portal=simulated',
        simulated: true
      });
    }

    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId = customers.data[0]?.id;

    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { userId } });
      customerId = customer.id;
    }

    const domain = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${domain}/app`,
    });

    return NextResponse.json({ url: portalSession.url, simulated: false });

  } catch (err: any) {
    console.error("Stripe Portal Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
