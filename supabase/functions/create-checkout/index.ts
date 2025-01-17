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

    // Validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      throw new Error('Authorization header is required');
    }

    // Initialize Supabase admin client with detailed error handling
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Server configuration error');
    }

    console.log('Initializing Supabase admin client...');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get request body
    const { amount, words, plan, documentName, type } = await req.json();
    console.log('Request payload:', { amount, words, plan, documentName, type });

    // Get the JWT token and verify user
    const token = authHeader.replace('Bearer ', '');
    console.log('Got token:', token.substring(0, 10) + '...');

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

    // Initialize Stripe with error handling
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Missing Stripe secret key');
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Look up or create customer
    console.log('Looking up customer for email:', user.email);
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId = customers.data[0]?.id;
    if (!customerId && user.email) {
      console.log('Creating new customer...');
      const newCustomer = await stripe.customers.create({
        email: user.email,
      });
      customerId = newCustomer.id;
    }

    console.log('Customer ID:', customerId);

    // Configure session based on type
    let sessionConfig;
    if (type === 'subscription' && plan) {
      const priceId = plan.toUpperCase() === 'PREMIUM' 
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