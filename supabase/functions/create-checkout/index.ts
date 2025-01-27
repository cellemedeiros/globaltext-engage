import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Starting checkout session creation...');

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header found');
      throw new Error('No authorization header');
    }

    console.log('Authorization header found, getting user...');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Authentication failed:', userError);
      throw new Error('Authentication failed');
    }

    if (!user.email) {
      console.error('User email not found');
      throw new Error('User email not found');
    }

    console.log('User authenticated successfully');

    const { amount, priceId, plan, type, documentName, filePath, sourceLanguage, targetLanguage, content } = await req.json();
    
    console.log('Creating Stripe instance...');
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    console.log('Looking up customer for email:', user.email);
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customer_id = undefined;
    if (customers.data.length > 0) {
      customer_id = customers.data[0].id;
      console.log('Existing customer found:', customer_id);
    } else {
      console.log('No existing customer found, will create new');
    }

    const metadata = {
      userId: user.id,
      type: type || 'subscription',
      plan: plan,
      documentName,
      filePath,
      sourceLanguage,
      targetLanguage,
      content
    };

    const sessionConfig = type === 'subscription' ? {
      mode: 'subscription' as const,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata,
      customer: customer_id,
      customer_email: customer_id ? undefined : user.email,
      success_url: `${req.headers.get('origin')}/dashboard?payment=success`,
      cancel_url: `${req.headers.get('origin')}/dashboard?error=cancelled`,
    } : {
      mode: 'payment' as const,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Translation Service',
              description: `Translation service for ${documentName || 'document'}`,
            },
            unit_amount: Math.round(parseFloat(amount) * 100),
          },
          quantity: 1,
        },
      ],
      metadata,
      customer: customer_id,
      customer_email: customer_id ? undefined : user.email,
      success_url: `${req.headers.get('origin')}/dashboard?payment=success`,
      cancel_url: `${req.headers.get('origin')}/dashboard?error=cancelled`,
    };

    console.log('Creating checkout session with config:', JSON.stringify(sessionConfig, null, 2));
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Payment session created:', session.id);
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating payment session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});