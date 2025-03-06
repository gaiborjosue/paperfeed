import { createClient } from '@supabase/supabase-js'

// Use environment variables with fallbacks for safety
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iqoobnpfdegngitnevwk.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Initialize standard client for client-side operations
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create an admin client for server-side operations that need to bypass RLS
const adminSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export { supabase, adminSupabase }

// Client-side Supabase helper for signup
export const createClientSupabase = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}