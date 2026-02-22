'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Card, CardContent, Input } from '@/components/ui'

type SignupStep = 1 | 2 | 3 | 4

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signup } = useAuth()

  const [step, setStep] = useState<SignupStep>(1)
  const [wizardData, setWizardData] = useState({
    practiceName: '',
    userEmail: '',
    practicePhone: '',
  })
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    confirmPassword: '',
    practiceAddress: '',
  })

  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const practiceName = searchParams.get('practiceName')
    const userEmail = searchParams.get('userEmail')
    const practicePhone = searchParams.get('practicePhone')
    if (practiceName || userEmail || practicePhone) {
      setWizardData(prev => ({
        ...prev,
        ...(practiceName && { practiceName }),
        ...(userEmail && { userEmail }),
        ...(practicePhone && { practicePhone }),
      }))
    }
  }, [searchParams])

  const handleWizardChange = (field: keyof typeof wizardData, value: string) => {
    setWizardData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
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
      if (!wizardData.practiceName.trim()) {
        setErrors({ practiceName: 'Please enter your office name' })
        return false
      }
    }
    if (s === 2) {
      if (!wizardData.userEmail.trim()) {
        setErrors({ userEmail: 'Please enter your office email' })
        return false
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(wizardData.userEmail)) {
        setErrors({ userEmail: 'Please enter a valid email address' })
        return false
      }
    }
    if (s === 3) {
      if (!wizardData.practicePhone.trim()) {
        setErrors({ practicePhone: 'Please enter your office phone number' })
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep(step)) return
    setStep((prev) => (prev + 1) as SignupStep)
  }

  const handleBack = () => {
    setErrors({})
    setStep((prev) => (prev - 1) as SignupStep)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setErrors({})

    const nextErrors: Record<string, string> = {}
    if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match'
    }
    if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters'
    }
    if (!formData.userName.trim()) {
      nextErrors.userName = 'Please enter your full name'
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsLoading(true)
    try {
      await signup({
        practiceName: wizardData.practiceName,
        userName: formData.userName,
        userEmail: wizardData.userEmail,
        password: formData.password,
        practicePhone: wizardData.practicePhone || undefined,
        practiceAddress: formData.practiceAddress || undefined,
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const progress = (step / 4) * 100

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-4 py-12">
      <Card className="w-full max-w-md border border-[#1a4d3c]/10 rounded-2xl shadow-sm">
        <CardContent className="p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Logo" className="h-16 w-16 mx-auto mb-4 object-contain" />
            <h1 className="text-2xl font-bold text-[#1a4d3c]">Create Account</h1>
            <p className="text-gray-600 mt-2">Join the Vector Referral network</p>
            {step > 0 && step < 4 && (
              <div className="mt-4">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1a4d3c] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Step {step} of 3</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Step 1: Office name */}
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="What is the name of your office?"
                type="text"
                value={wizardData.practiceName}
                onChange={(e) => handleWizardChange('practiceName', e.target.value)}
                error={errors.practiceName}
                placeholder="Smith Dental Clinic"
                autoFocus
              />
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full bg-[#1a4d3c] hover:bg-[#0f3328] text-white rounded-lg"
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
                value={wizardData.userEmail}
                onChange={(e) => handleWizardChange('userEmail', e.target.value)}
                error={errors.userEmail}
                placeholder="contact@yourclinic.com"
                autoFocus
              />
              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" className="flex-1 border-[#1a4d3c] text-[#1a4d3c] hover:bg-[#1a4d3c]/5 rounded-lg" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="flex-1 bg-[#1a4d3c] hover:bg-[#0f3328] text-white rounded-lg"
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
                value={wizardData.practicePhone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d\s\-+()]/g, '')
                  handleWizardChange('practicePhone', value)
                }}
                error={errors.practicePhone}
                placeholder="+1 (555) 123-4567"
                autoFocus
              />
              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" className="flex-1 border-[#1a4d3c] text-[#1a4d3c] hover:bg-[#1a4d3c]/5 rounded-lg" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="flex-1 bg-[#1a4d3c] hover:bg-[#0f3328] text-white rounded-lg"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Account completion */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Complete your account. Your office: <strong>{wizardData.practiceName}</strong>
              </p>
              <Input
                label="Full Name"
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                error={errors.userName}
                placeholder="Dr. John Smith"
                required
              />
              <Input
                label="Address (optional)"
                type="text"
                name="practiceAddress"
                value={formData.practiceAddress}
                onChange={handleChange}
                placeholder="123 Main St, City, State"
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
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
                required
              />
              <div className="text-xs text-gray-500">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-[#1a4d3c] hover:text-[#0f3328] font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#1a4d3c] hover:text-[#0f3328] font-medium">
                  Privacy Policy
                </Link>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" className="flex-1 border-[#1a4d3c] text-[#1a4d3c] hover:bg-[#1a4d3c]/5 rounded-lg" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1 bg-[#1a4d3c] hover:bg-[#0f3328] text-white rounded-lg"
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
            <Link href="/login" className="font-medium text-[#1a4d3c] hover:text-[#0f3328]">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a4d3c]" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}
