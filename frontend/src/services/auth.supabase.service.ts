import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import type { User, SignupData } from '@/types'

/**
 * Authentication Service using Supabase Auth
 */
export const authService = {
  /**
   * Sign up new user with Supabase Auth
   * Sends verification email automatically
   */
  async signup(data: SignupData): Promise<{ success: boolean; message: string; requiresEmailVerification: boolean }> {
    try {
      console.log('Signing up user:', data.email)
      
      // Step 1: Create user in our backend (which creates Supabase auth user + profile)
      const response = await api.post('/auth/signup', data)
      
      console.log('Signup response:', response.data)
      
      // Handle response format from backend
      // Backend returns: { success: true, message: "...", data: { user: {...}, requiresEmailVerification: true } }
      const requiresEmailVerification = response.data.data?.requiresEmailVerification ?? true
      
      return {
        success: true,
        message: response.data.message || 'Please check your email to verify your account.',
        requiresEmailVerification: requiresEmailVerification,
      }
    } catch (error: any) {
      console.error('Signup API error:', error)
      console.error('Error response:', error?.response?.data)
      console.error('Error status:', error?.response?.status)
      
      // Extract detailed error message
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.error 
        || error?.message 
        || 'Signup failed. Please try again.'
      
      throw new Error(errorMessage)
    }
  },

  /**
   * Login user with Supabase Auth
   */
  async login(email: string, password: string): Promise<{ user: User; session: any }> {
    try {
      // Login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email before logging in. Check your inbox for the verification link.')
        }
        throw new Error(error.message)
      }

      if (!data.session) {
        throw new Error('No session returned')
      }

      // Store the session token
      localStorage.setItem('auth_token', data.session.access_token)

      // Get user profile from our backend
      api.defaults.headers.common['Authorization'] = `Bearer ${data.session.access_token}`
      const profileResponse = await api.get<{ success: boolean; data: User }>('/auth/profile')

      return {
        user: profileResponse.data.data,
        session: data.session,
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed')
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await supabase.auth.signOut()
    localStorage.removeItem('auth_token')
    delete api.defaults.headers.common['Authorization']
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // Check Supabase session
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        return null
      }

      // Get profile from backend
      api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`
      const response = await api.get<{ success: boolean; data: User }>('/auth/profile')
      
      return response.data.data
    } catch (error) {
      return null
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  },

  /**
   * Get auth session
   */
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  /**
   * Get auth token
   */
  async getToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  },

  /**
   * Reset password (send reset email)
   */
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      throw new Error(error.message)
    }
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    // Supabase will automatically send verification email when user tries to login
    // with unverified email
    try {
      await supabase.auth.signInWithPassword({
        email,
        password: 'dummy', // Will fail but trigger email if unverified
      })
    } catch {
      // Expected to fail, email will be sent if user exists and is unverified
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
      
      // Update axios header when session changes
      if (session?.access_token) {
        localStorage.setItem('auth_token', session.access_token)
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`
      } else {
        localStorage.removeItem('auth_token')
        delete api.defaults.headers.common['Authorization']
      }
    })
  },
}

