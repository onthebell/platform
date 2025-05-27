import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export const formatCurrency = (amount: number, currency: string = 'AUD') => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
  }).format(amount / 100);
};
