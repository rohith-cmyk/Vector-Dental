import api from '@/lib/api'
import type {
    AuthResponse,
    ApiResponse,
    PaginatedResponse,
    DashboardStats,
    Specialist,
    Referral,
} from '@/types'

// Auth Services
export const authService = {
    async signup(data: {
        practiceName: string
        practicePhone?: string
        practiceAddress?: string
        practiceEmail?: string
        userName: string
        userEmail: string
        password: string
    }): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/signup', data)
        return response.data
    },

    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', { email, password })
        return response.data
    },

    logout() {
        localStorage.removeItem('gd_token')
        localStorage.removeItem('gd_user')
    },
}

// Dashboard Services
export const dashboardService = {
    async getStats(): Promise<ApiResponse<{ stats: DashboardStats; recentReferrals: Referral[] }>> {
        const response = await api.get('/dashboard/stats')
        return response.data
    },
}

// Specialist Services
export const specialistService = {
    async getDirectory(params?: {
        page?: number
        limit?: number
        search?: string
        specialty?: string
    }): Promise<PaginatedResponse<Specialist>> {
        const response = await api.get('/specialists', { params })
        return response.data
    },

    async getProfile(id: string): Promise<ApiResponse<Specialist>> {
        const response = await api.get(`/specialists/${id}`)
        return response.data
    },
}

// Referral Services
export const referralService = {
    async getMyReferrals(params?: {
        page?: number
        limit?: number
        status?: string
        search?: string
    }): Promise<PaginatedResponse<Referral>> {
        const response = await api.get('/referrals', { params })
        return response.data
    },

    async getReferralById(id: string): Promise<ApiResponse<Referral>> {
        const response = await api.get(`/referrals/${id}`)
        return response.data
    },

    async createReferral(data: {
        specialistUserId: string
        patientFirstName: string
        patientLastName: string
        patientDob: string
        patientPhone?: string
        patientEmail?: string
        insurance?: string
        reason: string
        urgency?: 'ROUTINE' | 'URGENT' | 'EMERGENCY'
        selectedTeeth?: string[]
        notes?: string
        status?: 'DRAFT' | 'SUBMITTED'
    }): Promise<ApiResponse<Referral>> {
        const response = await api.post('/referrals', data)
        return response.data
    },
}
