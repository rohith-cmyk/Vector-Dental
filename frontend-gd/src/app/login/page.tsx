'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Card, CardContent, Input } from '@/components/ui'

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
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <Card className="w-full max-w-md border border-gray-200 shadow-sm">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <img src="/logo.png" alt="Logo" className="h-16 w-16 mx-auto mb-4" />
                        <h1 className="text-2xl font-semibold text-gray-900">Welcome Back</h1>
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

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full bg-emerald-500 hover:bg-emerald-600"
                            isLoading={isLoading}
                        >
                            Sign In
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-medium text-emerald-600 hover:text-emerald-700">
                            Sign up for free
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
