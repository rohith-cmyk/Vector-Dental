'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.supabase.service'
import { api } from '@/lib/api'
import { USE_MOCK_DATA } from '@/constants'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    // Skip auth check when using mock data in development
    if (USE_MOCK_DATA) {
      setCheckingAuth(false)
      return
    }

    const checkAuth = async () => {
      try {
        const session = await authService.getSession()
        if (!session?.access_token) {
          router.replace('/login')
          return
        }

        // Ensure API requests have the token on refresh
        localStorage.setItem('auth_token', session.access_token)
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  if (checkingAuth) {
    return (
      <LoadingState
        className="min-h-screen"
        title="Preparing your dashboard..."
        subtitle="Checking your session"
      />
    )
  }

  return <>{children}</>
}

