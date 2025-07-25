import { createClient } from '@supabase/supabase-js';

// Project details from Supabase
const SUPABASE_URL = 'https://vksatiponelliqsypayj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrc2F0aXBvbmVsbGlxc3lwYXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzOTQzNDUsImV4cCI6MjA2ODk3MDM0NX0.8YVeh1aG8m6-9PqPJZiMAWIv6hM_SjLfg6aviAs3paA';

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export default supabase;