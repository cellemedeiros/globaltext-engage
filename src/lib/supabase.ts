import { createClient } from '@supabase/supabase-js';

// These values will be replaced with actual values from your Supabase project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Anon Key. Please connect to Supabase from the Lovable interface.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);