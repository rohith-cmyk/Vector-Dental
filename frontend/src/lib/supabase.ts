import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oezqvqdlmdowtloygkmz.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lenF2cWRsbWRvd3Rsb3lna216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDMxOTEsImV4cCI6MjA3NzQxOTE5MX0.liivtZV-2-R9RMkKSkSdEWbi3KnWKBGUA2eaiIvXs0o'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

