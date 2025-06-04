import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { verifyPostalCode } from '@/lib/firebase/verification';
import Stripe from 'stripe';

// POST /api/verification/postal - Create postal verification with payment
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { action, ...data } = await request.json();

    if (action === 'create-payment-intent') {
      // Create Stripe payment intent for postal verification
      console.log('Creating payment intent...');
      console.log('Stripe secret key exists:', !!process.env.STRIPE_SECRET_KEY);

      if (!process.env.STRIPE_SECRET_KEY) {
        console.error('STRIPE_SECRET_KEY environment variable not set');
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2025-04-30.basil',
      });

      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: 500, // $5.00 AUD in cents
          currency: 'aud',
          metadata: {
            userId: user.id,
            type: 'postal_verification',
            address: JSON.stringify(data.address),
          },
          description: 'OnTheBell Address Verification - Postal Code',
        });

        console.log('Payment intent created successfully:', paymentIntent.id);

        return NextResponse.json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        });
      } catch (stripeError) {
        console.error('Stripe payment intent creation failed:', stripeError);
        return NextResponse.json(
          {
            error: 'Failed to create payment intent',
            details: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error',
          },
          { status: 500 }
        );
      }
    }

    if (action === 'verify-code') {
      const { code } = data;

      if (!code) {
        return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
      }

      const result = await verifyPostalCode(user.id, code);

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in postal verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
