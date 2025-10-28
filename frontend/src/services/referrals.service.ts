import { api } from '@/lib/api'
import type { Referral, PaginatedResponse, ReferralStatus } from '@/types'

/**
 * Referrals Service
 */
export const referralsService = {
  /**
   * Get all referrals
   */
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
    status?: ReferralStatus
    urgency?: string
  }): Promise<PaginatedResponse<Referral>> {
    const response = await api.get<PaginatedResponse<Referral>>('/referrals', { params })
    return response.data
  },

  /**
   * Get referral by ID
   */
  async getById(id: string): Promise<Referral> {
    const response = await api.get<Referral>(`/referrals/${id}`)
    return response.data
  },

  /**
   * Create new referral
   */
  async create(data: Partial<Referral>): Promise<Referral> {
    const response = await api.post<Referral>('/referrals', data)
    return response.data
  },

  /**
   * Update referral
   */
  async update(id: string, data: Partial<Referral>): Promise<Referral> {
    const response = await api.put<Referral>(`/referrals/${id}`, data)
    return response.data
  },

  /**
   * Delete referral
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/referrals/${id}`)
  },

  /**
   * Update referral status
   */
  async updateStatus(id: string, status: ReferralStatus): Promise<Referral> {
    const response = await api.patch<Referral>(`/referrals/${id}/status`, { status })
    return response.data
  },
}

