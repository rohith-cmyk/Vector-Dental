import { api } from '@/lib/api'
import { dashboardService } from '@/services/dashboard.service'
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
    type?: 'received' | 'sent'
  }): Promise<PaginatedResponse<Referral>> {
    const response = await api.get<PaginatedResponse<Referral>>('/referrals', { params })
    return response.data
  },

  /**
   * Get referral by ID
   */
  async getById(id: string): Promise<Referral> {
    const response = await api.get<{ success: boolean; data: Referral }>(`/referrals/${id}`)
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error('Failed to get referral')
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
    const response = await api.patch<{ success: boolean; data: Referral }>(`/referrals/${id}/status`, { status })
    if (response.data.success && response.data.data) {
      dashboardService.clearCache()
      return response.data.data
    }
    throw new Error('Failed to update referral status')
  },

  /**
   * Submit ops report with attachments
   */
  async submitOpsReport(id: string, payload: { comment?: string; files?: File[] }): Promise<any> {
    const formData = new FormData()
    if (payload.comment) {
      formData.append('comment', payload.comment)
    }
    if (payload.files?.length) {
      payload.files.forEach((file) => formData.append('files', file))
    }
    const response = await api.post<{ success: boolean; data: any }>(`/referrals/${id}/ops-report`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },

  /**
   * Share referral - Generate share token and send email
   */
  async shareReferral(id: string): Promise<{ shareUrl: string; shareToken: string; mailtoLink?: string }> {
    const response = await api.post<{ success: boolean; data: { shareUrl: string; shareToken: string; mailtoLink?: string } }>(`/referrals/${id}/share`)
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error('Failed to share referral')
  },

  /**
   * Get referral status by status token
   */
  async getStatusByToken(statusToken: string): Promise<any> {
    const response = await api.get<{ success: boolean; data: any }>(`/referrals/status/${statusToken}`)
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error('Failed to get referral status')
  },
}

