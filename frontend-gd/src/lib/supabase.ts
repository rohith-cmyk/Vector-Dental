import { createClient } from '@supabase/supabase-js'

// Placeholders allow Docker build to succeed when env vars not yet set; override via build args
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-anon-key') {
  console.warn('Missing Supabase env vars for GD frontend - using placeholders')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
