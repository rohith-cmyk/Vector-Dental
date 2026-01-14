'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.supabase.service'
import { api } from '@/lib/api'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const redirect = async () => {
      const session = await authService.getSession()
      if (session?.access_token) {
        localStorage.setItem('auth_token', session.access_token)
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }

    redirect()
  }, [router])

  return null
}
