'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { authSupabaseService } from '@/services/auth.supabase.service'
import { Button, Card, CardContent, Input } from '@/components/ui'

export default function SignupPage() {
    const router = useRouter()
    const { signup } = useAuth()

    const [formData, setFormData] = useState({
        practiceName: '',
        userName: '',
        userEmail: '',
        password: '',
        confirmPassword: '',
        practicePhone: '',
        practiceAddress: '',
    })

    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [oauthLoading, setOauthLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setFieldErrors({})

        const nextErrors: Record<string, string> = {}

        if (formData.password !== formData.confirmPassword) {
            nextErrors.confirmPassword = 'Passwords do not match'
        }

        if (formData.password.length < 6) {
            nextErrors.password = 'Password must be at least 6 characters'
        }

        if (Object.keys(nextErrors).length > 0) {
            setFieldErrors(nextErrors)
            return
        }

        setIsLoading(true)

        try {
            await signup({
                practiceName: formData.practiceName,
                userName: formData.userName,
                userEmail: formData.userEmail,
                password: formData.password,
                practicePhone: formData.practicePhone || undefined,
                practiceAddress: formData.practiceAddress || undefined,
            })
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignup = async () => {
        try {
            setOauthLoading(true)
            await authSupabaseService.loginWithGoogle()
        } catch (err: any) {
            setError(err?.message || 'Google signup failed. Please try again.')
            setOauthLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <Card className="w-full max-w-2xl">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <img src="/logo.png" alt="Logo" className="h-16 w-16 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900">Create GD Account</h1>
                        <p className="text-gray-600 mt-2">Join the dental referral network</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4 mb-6">
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
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Information</h3>
                                <div className="space-y-4">
                                    <Input
                                        label="Practice Name *"
                                        id="practiceName"
                                        name="practiceName"
                                        type="text"
                                        required
                                        value={formData.practiceName}
                                        onChange={handleChange}
                                        placeholder="Smith Dental Practice"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Phone"
                                            id="practicePhone"
                                            name="practicePhone"
                                            type="tel"
                                            value={formData.practicePhone}
                                            onChange={handleChange}
                                            placeholder="+1 (555) 123-4567"
                                        />

                                        <Input
                                            label="Address"
                                            id="practiceAddress"
                                            name="practiceAddress"
                                            type="text"
                                            value={formData.practiceAddress}
                                            onChange={handleChange}
                                            placeholder="123 Main St, City, State"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
                                <div className="space-y-4">
                                    <Input
                                        label="Full Name *"
                                        id="userName"
                                        name="userName"
                                        type="text"
                                        required
                                        value={formData.userName}
                                        onChange={handleChange}
                                        placeholder="Dr. John Smith"
                                    />

                                    <Input
                                        label="Email Address *"
                                        id="userEmail"
                                        name="userEmail"
                                        type="email"
                                        required
                                        value={formData.userEmail}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Password *"
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            error={fieldErrors.password}
                                        />

                                        <Input
                                            label="Confirm Password *"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            error={fieldErrors.confirmPassword}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                            Create Account
                        </Button>

                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
