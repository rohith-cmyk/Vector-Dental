'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '@/services/api'
import type { User, Clinic } from '@/types'

interface AuthContextType {
    user: User | null
    clinic: Clinic | null
    token: string | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    signup: (data: {
        practiceName: string
        userName: string
        userEmail: string
        password: string
        practicePhone?: string
        practiceAddress?: string
        practiceEmail?: string
    }) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [clinic, setClinic] = useState<Clinic | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Load user from localStorage on mount
        const storedToken = localStorage.getItem('gd_token')
        const storedUser = localStorage.getItem('gd_user')
        const storedClinic = localStorage.getItem('gd_clinic')

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
            if (storedClinic) {
                setClinic(JSON.parse(storedClinic))
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string) => {
        const response = await authService.login(email, password)
        const { user, clinic, token } = response.data

        setUser(user)
        setClinic(clinic || null)
        setToken(token)

        localStorage.setItem('gd_token', token)
        localStorage.setItem('gd_user', JSON.stringify(user))
        if (clinic) {
            localStorage.setItem('gd_clinic', JSON.stringify(clinic))
        }
    }

    const signup = async (data: {
        practiceName: string
        userName: string
        userEmail: string
        password: string
        practicePhone?: string
        practiceAddress?: string
        practiceEmail?: string
    }) => {
        const response = await authService.signup(data)
        const { user, clinic, token } = response.data

        setUser(user)
        setClinic(clinic || null)
        setToken(token)

        localStorage.setItem('gd_token', token)
        localStorage.setItem('gd_user', JSON.stringify(user))
        if (clinic) {
            localStorage.setItem('gd_clinic', JSON.stringify(clinic))
        }
    }

    const logout = () => {
        authService.logout()
        setUser(null)
        setClinic(null)
        setToken(null)
    }

    return (
        <AuthContext.Provider value={{ user, clinic, token, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
