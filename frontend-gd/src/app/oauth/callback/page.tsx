'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authSupabaseService } from '@/services/auth.supabase.service'
import { LoadingState } from '@/components/ui'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const status = await authSupabaseService.getOAuthStatus()

        if (!status.exists) {
          router.replace('/signup/complete')
          return
        }

        if (status.user && status.token) {
          localStorage.setItem('gd_token', status.token)
          localStorage.setItem('gd_user', JSON.stringify(status.user))
          if (status.clinic) {
            localStorage.setItem('gd_clinic', JSON.stringify(status.clinic))
          }
        }

        router.replace('/dashboard')
      } catch (err: any) {
        console.error('OAuth callback error:', err)
        setError(err?.message || 'Google sign-in failed. Please try again.')
      }
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            className="mt-4 text-sm text-brand-600 hover:text-brand-700"
            onClick={() => router.replace('/login')}
          >
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState title="Signing you in..." subtitle="Finalizing your account" />
    </div>
  )
}
