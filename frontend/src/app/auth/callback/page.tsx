'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash from URL (Supabase sends tokens in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const type = hashParams.get('type')

        if (type === 'signup') {
          // Email verification successful
          setStatus('success')
          setMessage('Email verified successfully! You can now log in.')
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else if (type === 'recovery') {
          // Password reset
          setStatus('success')
          setMessage('Please enter your new password.')
          router.push('/auth/reset-password')
        } else if (accessToken) {
          // Already logged in, redirect to dashboard
          setStatus('success')
          setMessage('Logging you in...')
          setTimeout(() => {
            router.push('/dashboard')
          }, 1000)
        } else {
          throw new Error('Invalid callback')
        }
      } catch (error: any) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage(error.message || 'Something went wrong. Please try again.')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900">Verifying...</h2>
              <p className="text-gray-600 mt-2">Please wait while we verify your email.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Success!</h2>
              <p className="text-gray-600 mt-2">{message}</p>
              <p className="text-sm text-gray-500 mt-4">Redirecting...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Verification Failed</h2>
              <p className="text-gray-600 mt-2">{message}</p>
              <button
                onClick={() => router.push('/login')}
                className="mt-6 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
              >
                Go to Login
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

