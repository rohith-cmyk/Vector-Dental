import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from './env'

/**
 * Supabase Client for Backend
 * Uses service_role key for admin operations
 * Uses placeholder URL when not configured (avoids crash at import - e.g. Railway before vars set)
 */

const supabaseUrl = config.supabaseUrl || 'https://placeholder.supabase.co'
const supabaseAnonKey = config.supabaseAnonKey || 'placeholder-anon-key'
const supabaseServiceKey = config.supabaseServiceKey || 'placeholder-service-key'

// For admin operations (bypasses RLS)
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// For client operations (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

