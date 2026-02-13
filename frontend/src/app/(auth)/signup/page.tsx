'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { authService } from '@/services/auth.supabase.service'
import { handleApiError } from '@/lib/api'
import { GD_PORTAL_URL } from '@/constants'

type SignupStep = 1 | 2 | 3 | 4 | 5
type UserRole = 'general_dentist' | 'specialist' | null

export default function SignupPage() {
  const router = useRouter()

  const [step, setStep] = useState<SignupStep>(1)
  const [wizardData, setWizardData] = useState({
    clinicName: '',
    email: '',
    phone: '',
    role: null as UserRole,
  })
  const [formData, setFormData] = useState({
    name: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleWizardChange = (field: keyof typeof wizardData, value: string | UserRole) => {
    setWizardData(prev => ({ ...prev, [field]: value }))
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateStep = (s: SignupStep): boolean => {
    setErrors({})
    if (s === 1) {
      if (!wizardData.clinicName.trim()) {
        setErrors({ clinicName: 'Please enter your office name' })
        return false
      }
    }
    if (s === 2) {
      if (!wizardData.email.trim()) {
        setErrors({ email: 'Please enter your office email' })
        return false
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(wizardData.email)) {
        setErrors({ email: 'Please enter a valid email address' })
        return false
      }
    }
    if (s === 3) {
      if (!wizardData.phone.trim()) {
        setErrors({ phone: 'Please enter your office phone number' })
        return false
      }
    }
    if (s === 4) {
      if (!wizardData.role) {
        setErrors({ role: 'Please select whether you are a General Dentist or Specialist' })
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep(step)) return

    if (step === 4) {
      if (wizardData.role === 'general_dentist') {
        const params = new URLSearchParams({
          practiceName: wizardData.clinicName,
          userEmail: wizardData.email,
          practicePhone: wizardData.phone,
        })
        window.location.href = `${GD_PORTAL_URL}/signup?${params.toString()}`
        return
      }
      setStep(5)
    } else {
      setStep((prev) => (prev + 1) as SignupStep)
    }
  }

  const handleBack = () => {
    setErrors({})
    if (step === 5) {
      setStep(4)
    } else {
      setStep((prev) => (prev - 1) as SignupStep)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setGeneralError('')
    setSuccessMessage('')
    setErrors({})

    if (formData.password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' })
      setIsLoading(false)
      return
    }

    try {
      const result = await authService.signup({
        name: formData.name,
        email: wizardData.email,
        password: formData.password,
        clinicName: wizardData.clinicName,
      })

      if (result.requiresEmailVerification) {
        router.push('/login?signup=success')
        return
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      let errorMessage = 'An unexpected error occurred'
      if (error?.response?.data?.message) errorMessage = error.response.data.message
      else if (error?.response?.data?.error) errorMessage = error.response.data.error
      else if (error?.message) errorMessage = error.message
      else if (typeof error === 'string') errorMessage = error
      if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error') || error?.message?.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please check if the backend is running.'
      }
      setGeneralError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const progress = step < 5 ? (step / 4) * 100 : 100

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Logo" className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Start managing referrals in Vector Referral</p>
            {step > 0 && step < 5 && (
              <div className="mt-4">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Step {step} of 4</p>
              </div>
            )}
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

          {/* Step 1: Office name */}
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="What is the name of your office?"
                type="text"
                value={wizardData.clinicName}
                onChange={(e) => handleWizardChange('clinicName', e.target.value)}
                error={errors.clinicName}
                placeholder="Smith Dental Clinic"
                autoFocus
              />
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          )}

          {/* Step 2: Office email */}
          {step === 2 && (
            <div className="space-y-4">
              <Input
                label="What is your office email?"
                type="email"
                value={wizardData.email}
                onChange={(e) => handleWizardChange('email', e.target.value)}
                error={errors.email}
                placeholder="contact@yourclinic.com"
                autoFocus
              />
              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Office phone */}
          {step === 3 && (
            <div className="space-y-4">
              <Input
                label="What is the phone number of your office?"
                type="tel"
                inputMode="numeric"
                value={wizardData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d\s\-+()]/g, '')
                  handleWizardChange('phone', value)
                }}
                error={errors.phone}
                placeholder="+1 (555) 123-4567"
                autoFocus
              />
              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: General Dentist or Specialist */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Are you a General Dentist or Specialist? We&apos;ll send you to the appropriate portal.
              </p>
              {errors.role && (
                <p className="text-sm text-red-600">{errors.role}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleWizardChange('role', 'general_dentist')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    wizardData.role === 'general_dentist'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="font-medium block">General Dentist</span>
                  <span className="text-xs text-gray-500 mt-1">Refer patients to specialists</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleWizardChange('role', 'specialist')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    wizardData.role === 'specialist'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="font-medium block">Specialist</span>
                  <span className="text-xs text-gray-500 mt-1">Receive referrals from GDs</span>
                </button>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Specialist account completion */}
          {step === 5 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Complete your specialist account. Your office: <strong>{wizardData.clinicName}</strong>
              </p>
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
                <Link href="/terms" className="text-emerald-600 hover:text-emerald-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700">
                  Privacy Policy
                </Link>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  isLoading={isLoading}
                >
                  Create Account
                </Button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
