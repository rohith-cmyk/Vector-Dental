'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, Input } from '@/components/ui'

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await login(email, password)
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-4">
            <Card className="w-full max-w-md border border-[#1a4d3c]/10 rounded-2xl shadow-sm">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <img src="/logo.png" alt="Logo" className="h-16 w-16 mx-auto mb-4 object-contain" />
                        <h1 className="text-2xl font-semibold text-[#1a4d3c]">Welcome Back</h1>
                        <p className="text-sm text-gray-600 mt-2">Sign in to your Vector Referral account</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-lg px-6 py-3 text-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a4d3c] disabled:opacity-50"
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

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-medium text-[#1a4d3c] hover:text-[#0f3328]">
                            Sign up for free
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
