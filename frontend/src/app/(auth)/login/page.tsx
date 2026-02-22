'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input, Card, CardContent } from '@/components/ui'
import { authService } from '@/services/auth.supabase.service'
import { handleApiError } from '@/lib/api'

// Separate component or main component wrapped in Suspense
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showSuccess = searchParams.get('signup') === 'success'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setGeneralError('')
    setErrors({})

    try {
      await authService.login(formData.email, formData.password)
      router.push('/dashboard')
    } catch (error: any) {
      const errorMessage = error.message || handleApiError(error)
      setGeneralError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border border-[#1a4d3c]/10 rounded-2xl shadow-sm">
      <CardContent className="p-8">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-16 w-16 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-semibold text-[#1a4d3c]">Welcome Back</h1>
          <p className="text-sm text-gray-600 mt-2">Sign in to your Vector Referral account</p>
        </div>

        {/* Success Message from Signup */}
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">✅ Account created successfully!</p>
            <p className="text-xs text-green-600 mt-2">
              Please check your email to verify your account before logging in.
            </p>
          </div>
        )}

        {/* Error Message */}
        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{generalError}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="your@email.com"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
            required
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2 rounded border-gray-300" />
              <span className="text-gray-600">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-[#1a4d3c] hover:text-[#0f3328] font-medium">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg px-6 py-3 text-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a4d3c] disabled:opacity-50 hover:bg-[#0f3328]"
            style={{ backgroundColor: '#1a4d3c' }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 inline h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Signup Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-[#1a4d3c] hover:text-[#0f3328]">
            Sign up for free
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

