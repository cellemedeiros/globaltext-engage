import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, plan, user_id, email, documentName, filePath, sourceLanguage, targetLanguage, type } = await req.json();

    console.log('Received checkout request:', { amount, plan, email, documentName, type });

    if (!amount || !email || !user_id) {
      throw new Error('Missing required fields: amount, email, or user_id');
    }

    // Create product for this payment
    let product;
    try {
      product = await stripe.products.create({
        name: type === 'subscription' 
          ? `${plan || 'Translation'} Plan` 
          : `Translation: ${documentName || 'Document'}`,
        description: type === 'subscription'
          ? `Translation service subscription - ${plan || 'Standard'} plan`
          : `One-time translation payment for ${documentName}`,
      });
      console.log('Created Stripe product:', product.id);
    } catch (error) {
      console.error('Error creating Stripe product:', error);
      throw error;
    }

    // Create price
    let price;
    try {
      const priceData = {
        product: product.id,
        unit_amount: Math.round(parseFloat(amount) * 100), // Convert to cents
        currency: 'brl',
      };

      // Add recurring property only for subscriptions
      if (type === 'subscription') {
        Object.assign(priceData, {
          recurring: {
            interval: 'month',
          },
        });
      }

      price = await stripe.prices.create(priceData);
      console.log('Created Stripe price:', price.id);
    } catch (error) {
      console.error('Error creating Stripe price:', error);
      throw error;
    }

    // Create checkout session
    try {
      const sessionData = {
        customer_email: email,
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        mode: type === 'subscription' ? 'subscription' : 'payment',
        success_url: `${req.headers.get('origin')}/payment?payment=success`,
        cancel_url: `${req.headers.get('origin')}/payment?error=cancelled`,
        metadata: {
          user_id,
          type,
          plan,
          documentName,
          filePath,
          sourceLanguage,
          targetLanguage,
        },
      };

      const session = await stripe.checkout.sessions.create(sessionData);
      console.log('Created checkout session:', session.id);

      return new Response(
        JSON.stringify({ url: session.url }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});