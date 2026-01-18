'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import { LoadingState } from '@/components/ui'

export default function OAuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session?.access_token) {
        router.replace('/login')
        return
      }

      localStorage.setItem('auth_token', session.access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`

      try {
        await api.get('/auth/profile')
        router.replace('/dashboard')
      } catch {
        router.replace('/signup/complete')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 px-4">
      <LoadingState
        title="Signing you in..."
        subtitle="Finishing secure login"
      />
    </div>
  )
}
