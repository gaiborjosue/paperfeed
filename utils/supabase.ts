
import { createClient } from '@supabase/supabase-js'

// Use environment variables with fallbacks for safety
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iqoobnpfdegngitnevwk.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxb29ibnBmZGVnbmdpdG5ldndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkyNTY3ODcsImV4cCI6MjAyNDgzMjc4N30.aSxIzimMeDcaVN05uzWBgaMXvlFIUKMuQXmzVp_3JcI'

// Initialize client with appropriate error handling
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { supabase }

// Client-side Supabase helper for signup
export const createClientSupabase = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}