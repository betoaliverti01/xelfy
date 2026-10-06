import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cxqmqmlyizduqojihzwc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4cW1xbWx5aXpkdXFvamloendjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMzczMTMsImV4cCI6MjEwNjgxMzMxM30.ceTHZbYhwDTEaS5ZYIJwUS6z03P8a1EzZXV2Ks_qvzA';

export const isSupabaseConfigured = Boolean(
  (import.meta.env.VITE_SUPABASE_URL || supabaseUrl) && 
  (import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseAnonKey)
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;
