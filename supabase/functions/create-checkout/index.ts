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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, plan, user_id, email, documentName, filePath, sourceLanguage, targetLanguage, content, type } = await req.json();

    console.log('Creating checkout session with params:', { amount, plan, email, documentName, type });

    // Create product based on payment type
    let product;
    try {
      if (type === 'subscription') {
        product = await stripe.products.create({
          name: `${plan} Translation Plan`,
          description: `Monthly translation service subscription - ${plan} plan`,
        });
      } else {
        product = await stripe.products.create({
          name: 'Document Translation',
          description: `Translation service for ${documentName}`,
        });
      }
      console.log('Created product:', product.id);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    // Create price based on payment type
    let price;
    try {
      if (type === 'subscription') {
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(parseFloat(amount) * 100),
          currency: 'brl',
          recurring: {
            interval: 'month',
          },
        });
      } else {
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(parseFloat(amount) * 100),
          currency: 'brl',
        });
      }
      console.log('Created price:', price.id);
    } catch (error) {
      console.error('Error creating price:', error);
      throw error;
    }

    // Create checkout session with appropriate mode and metadata
    try {
      const session = await stripe.checkout.sessions.create({
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
        subscription_data: type === 'subscription' ? {
          metadata: {
            user_id,
            plan,
            type: 'subscription'
          }
        } : undefined,
        metadata: type === 'subscription' ? {
          user_id,
          plan,
          type: 'subscription'
        } : {
          user_id,
          type: 'payment',
          documentName,
          filePath
        },
      });

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
  } catch (error) {
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