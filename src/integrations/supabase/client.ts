import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qriwrblyyrxpzzwrnmto.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyaXdyYmx5eXJ4cHp6d3JubXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ3MzY4ODgsImV4cCI6MjAyMDMxMjg4OH0.0eTW-TRibvc-FFW8FbYO3xeXN9tBfT6DIyYIhKS9_ys';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});