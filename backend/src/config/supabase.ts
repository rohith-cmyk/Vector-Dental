import { createClient } from '@supabase/supabase-js'
import { config } from './env'

/**
 * Supabase Client for Backend
 * Uses service_role key for admin operations
 */

// For admin operations (bypasses RLS)
export const supabaseAdmin = createClient(
  config.supabaseUrl,
  config.supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// For client operations (respects RLS)
export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey
)

