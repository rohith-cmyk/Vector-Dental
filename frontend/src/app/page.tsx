'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Skip authentication in development - go straight to dashboard
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="h-16 w-16 mx-auto mb-4 animate-pulse"
        />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
