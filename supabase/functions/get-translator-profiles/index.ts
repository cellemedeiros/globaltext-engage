import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables');
    }

    console.log('Initializing Supabase client...');
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    console.log('Fetching approved translator profiles...');
    // Get approved translator profiles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, role, is_approved_translator')
      .eq('role', 'translator')
      .eq('is_approved_translator', true)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles.length} approved translators`);

    // Get emails for each profile
    const profilesWithEmail = await Promise.all(
      profiles.map(async (profile) => {
        const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(profile.id)
        if (userError) {
          console.error('Error fetching user:', userError);
          throw userError;
        }
        return {
          ...profile,
          email: user?.email
        }
      })
    )

    console.log('Successfully processed all profiles with emails');

    return new Response(
      JSON.stringify(profilesWithEmail),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in get-translator-profiles:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})