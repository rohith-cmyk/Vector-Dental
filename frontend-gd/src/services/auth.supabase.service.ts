import api from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { Clinic, User } from '@/types'

interface OAuthStatusResponse {
  exists: boolean
  user?: User
  clinic?: Clinic | null
  token?: string
  email?: string | null
  name?: string
}

export const authSupabaseService = {
  async loginWithGoogle(redirectTo?: string): Promise<void> {
    const redirectUrl = redirectTo || `${window.location.origin}/oauth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })

    if (error) {
      throw new Error(error.message)
    }
  },

  async getOAuthStatus(): Promise<OAuthStatusResponse> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('No active session. Please try again.')
    }

    const response = await api.get<{ success: boolean; data: OAuthStatusResponse }>('/auth/oauth/status', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    return response.data.data
  },

  async completeOAuthSignup(data: { practiceName: string; practicePhone?: string; practiceAddress?: string }) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('No active session. Please sign in again.')
    }

    const response = await api.post<{ success: boolean; data: { user: User; clinic?: Clinic | null; token: string } }>(
      '/auth/oauth/complete',
      data,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    )

    return response.data.data
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut()
  },
}
