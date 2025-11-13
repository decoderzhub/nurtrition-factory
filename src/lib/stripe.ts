import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!key || key === 'your_stripe_publishable_key_here') {
      console.warn('Stripe publishable key is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env file.');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export const formatAmount = (amount: number): string => {
  return (amount / 100).toFixed(2);
};

export const parseAmount = (amount: number): number => {
  return Math.round(amount * 100);
};

export const isStripeConfigured = (): boolean => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  return !!(key && key !== 'your_stripe_publishable_key_here');
};
