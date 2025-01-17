import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qriwrblyyrxpzzwrnmto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyaXdyYmx5eXJ4cHp6d3JubXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzMTcxMjgsImV4cCI6MjA0OTg5MzEyOH0.T6MSrs11uOzNBE_v55vZQ7uXA-Bn_aGqMxyfHOREAug";

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Anon Key');
}

export const supabase = createClient(supabaseUrl, supabaseKey);