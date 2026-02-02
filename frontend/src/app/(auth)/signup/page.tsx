'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { authService } from '@/services/auth.supabase.service'
import { handleApiError } from '@/lib/api'

export default function SignupPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    clinicName: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

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
    setSuccessMessage('')
    setErrors({})

    // Basic validation
    if (formData.password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' })
      setIsLoading(false)
      return
    }

    try {
      const result = await authService.signup(formData)

      if (result.requiresEmailVerification) {
        // Redirect to login page with success message
        router.push('/login?signup=success')
        return
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      console.error('Error details:', error?.response?.data || error?.message || error)

      // Extract more detailed error message
      let errorMessage = 'An unexpected error occurred'

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      // Handle network errors
      if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error') || error?.message?.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please check if the backend is running.'
      }

      setGeneralError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setOauthLoading(true)
      await authService.loginWithGoogle()
    } catch (error: any) {
      setGeneralError(error.message || 'Google signup failed')
      setOauthLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-16 w-16 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Start managing referrals in Vector Dental</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">✅ {successMessage}</p>
              <p className="text-xs text-green-600 mt-2">
                Check your spam folder if you don&apos;t see the email within a few minutes.
              </p>
            </div>
          )}

          {/* Error Message */}
          {generalError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{generalError}</p>
            </div>
          )}

          {/* OAuth */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleGoogleSignup}
            isLoading={oauthLoading}
          >
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-500">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Dr. John Smith"
              required
            />

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
              label="Clinic Name"
              type="text"
              name="clinicName"
              value={formData.clinicName}
              onChange={handleChange}
              error={errors.clinicName}
              placeholder="Smith Dental Clinic"
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

            <div className="text-xs text-gray-500">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-brand-600 hover:text-brand-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-brand-600 hover:text-brand-700">
                Privacy Policy
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

