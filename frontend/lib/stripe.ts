import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export const getStripe = (): Stripe | null => {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27' as any,
    });
  }
  return stripeClient;
};
