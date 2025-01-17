import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    console.log('Starting checkout session creation...');

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      throw new Error('Authorization header is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Server configuration error');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the JWT token
    const token = authHeader.replace('Bearer ', '');
    console.log('Got token:', token.substring(0, 10) + '...');

    // Verify the user session using the admin client
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError) {
      console.error('User verification error:', userError);
      throw new Error(`Authentication failed: ${userError.message}`);
    }

    if (!user) {
      console.error('No user found after verification');
      throw new Error('User not found');
    }

    console.log('User authenticated:', user.id);

    // Get request body
    const { amount, words, plan, documentName, type } = await req.json();
    console.log('Request payload:', { amount, words, plan, documentName, type });

    if (!amount && !plan) {
      throw new Error('Either amount or plan is required');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Look up or create customer
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId = customers.data[0]?.id;
    if (!customerId && user.email) {
      const newCustomer = await stripe.customers.create({
        email: user.email,
      });
      customerId = newCustomer.id;
    }

    console.log('Customer ID:', customerId);

    // Configure session based on type
    let sessionConfig;
    if (type === 'subscription') {
      const priceId = plan?.toUpperCase() === 'PREMIUM' 
        ? Deno.env.get('PREMIUM_PLAN_PRICE')
        : Deno.env.get('STANDARD_PLAN_PRICE');

      if (!priceId) {
        throw new Error(`Invalid plan configuration for ${plan}`);
      }

      sessionConfig = {
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: {
          type: 'subscription',
          plan,
          userId: user.id,
        },
      };
    } else {
      sessionConfig = {
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Translation Service - ${words} words`,
            },
            unit_amount: Math.round(parseFloat(amount) * 100),
          },
          quantity: 1,
        }],
        metadata: {
          type: 'translation',
          documentName,
          userId: user.id,
          words,
        },
      };
    }

    // Create Stripe checkout session
    console.log('Creating checkout session with config:', sessionConfig);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      ...sessionConfig,
      success_url: `${req.headers.get('origin')}/dashboard?payment=success`,
      cancel_url: `${req.headers.get('origin')}/payment?error=cancelled`,
    });

    console.log('Checkout session created:', session.id);
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