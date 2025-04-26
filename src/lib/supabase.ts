import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage, // Use localStorage for session persistence
    autoRefreshToken: true,
    persistSession: true
  }
});

// Function to clear auth on logout
export const clearAuthStorage = () => {
  // Clear Supabase specific items
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('supabase.auth.expires_at');
  localStorage.removeItem('supabase.auth.refresh_token');
  
  // Also clear our custom session storage
  localStorage.removeItem('userSession');
  localStorage.removeItem('userHasCar');
};