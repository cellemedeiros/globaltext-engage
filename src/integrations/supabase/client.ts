import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qriwrblyyrxpzzwrnmto.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyaXdyYmx5eXJ4cHp6d3JubXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzMTcxMjgsImV4cCI6MjA0OTg5MzEyOH0.T6MSrs11uOzNBE_v55vZQ7uXA-Bn_aGqMxyfHOREAug';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        try {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        } catch (error) {
          console.error('Error reading from localStorage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error('Error writing to localStorage:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      }
    }
  }
});

// Initialize auth state from stored session
supabase.auth.getSession().catch(error => {
  console.error('Error initializing auth session:', error);
  // Clear any invalid session data
  supabase.auth.signOut().catch(console.error);
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear any stored auth data
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    }
  }
});