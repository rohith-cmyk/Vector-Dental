'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.supabase.service'
import { api } from '@/lib/api'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
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

    // Keep auth_token in sync when Supabase auto-refreshes (e.g. token renewal)
    const { data: authListener } = authService.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        localStorage.setItem('auth_token', session.access_token)
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`
      }
    })

    return () => authListener?.subscription?.unsubscribe?.()
  }, [router])

  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400" />
        <p className="text-sm font-medium text-gray-700">Preparing your dashboard...</p>
        <p className="text-xs text-gray-500">Checking your session</p>
      </div>
    )
  }

  return <>{children}</>
}

