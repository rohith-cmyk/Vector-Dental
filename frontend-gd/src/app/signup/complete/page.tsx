'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authSupabaseService } from '@/services/auth.supabase.service'
import { Button, Card, CardContent, Input } from '@/components/ui'

export default function CompleteSignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    practiceName: '',
    practicePhone: '',
    practiceAddress: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.practiceName.trim()) {
      setError('Practice name is required')
      return
    }

    setIsLoading(true)
    try {
      const response = await authSupabaseService.completeOAuthSignup({
        practiceName: formData.practiceName.trim(),
        practicePhone: formData.practicePhone || undefined,
        practiceAddress: formData.practiceAddress || undefined,
      })

      localStorage.setItem('gd_token', response.token)
      localStorage.setItem('gd_user', JSON.stringify(response.user))
      if (response.clinic) {
        localStorage.setItem('gd_clinic', JSON.stringify(response.clinic))
      }

      router.replace('/dashboard')
    } catch (err: any) {
      console.error('Complete signup error:', err)
      setError(err?.message || 'Failed to complete signup. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Logo" className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Complete Your GD Profile</h1>
            <p className="text-gray-600 mt-2">Add your practice details to continue</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Practice Name *"
              name="practiceName"
              value={formData.practiceName}
              onChange={handleChange}
              placeholder="Smith Dental Practice"
              required
            />

            <Input
              label="Phone"
              name="practicePhone"
              value={formData.practicePhone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />

            <Input
              label="Address"
              name="practiceAddress"
              value={formData.practiceAddress}
              onChange={handleChange}
              placeholder="123 Main St, City, State"
            />

            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
