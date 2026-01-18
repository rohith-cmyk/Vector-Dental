import { api } from '@/lib/api'
import type {
  ReferralLink,
  CreateReferralLinkRequest,
  CreateReferralLinkResponse,
  ApiResponse,
} from '@/types'

/**
 * Referral Link Service
 */
export const referralLinkService = {
  /**
   * Create a new referral link
   */
  async create(data: CreateReferralLinkRequest): Promise<CreateReferralLinkResponse> {
    const response = await api.post<ApiResponse<CreateReferralLinkResponse>>(
      '/referral-links',
      data
    )
    return response.data.data
  },

  /**
   * List all referral links for the authenticated specialist
   */
  async list(): Promise<ReferralLink[]> {
    const response = await api.get<ApiResponse<ReferralLink[]>>('/referral-links')
    return response.data.data
  },

  /**
   * Get a single referral link by ID
   */
  async getById(id: string): Promise<ReferralLink> {
    const response = await api.get<ApiResponse<ReferralLink>>(`/referral-links/${id}`)
    return response.data.data
  },

  /**
   * Update a referral link
   */
  async update(
    id: string,
    data: {
      isActive?: boolean
      label?: string
      regenerateAccessCode?: boolean
    }
  ): Promise<{ referralLink: ReferralLink; accessCode?: string }> {
    const response = await api.put<ApiResponse<{ referralLink: ReferralLink; accessCode?: string }>>(
      `/referral-links/${id}`,
      data
    )
    return response.data.data
  },

  /**
   * Delete a referral link
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/referral-links/${id}`)
  },

  /**
   * Get referral link info by token (public endpoint)
   */
  async getByToken(token: string): Promise<{
    token: string
    label?: string
    clinicName: string
    clinicAddress?: string
    clinicPhone?: string
    clinicEmail?: string
    clinicLogoUrl?: string
    specialistName: string
    specialty?: string
  }> {
    const response = await api.get<ApiResponse<any>>(`/public/referral-link/${token}`)
    return response.data.data
  },

  /**
   * Verify access code (public endpoint)
   */
  async verifyAccessCode(token: string, accessCode: string): Promise<{ verified: boolean }> {
    const response = await api.post<ApiResponse<{ verified: boolean }>>(
      `/public/referral-link/${token}/verify`,
      { accessCode }
    )
    return response.data.data
  },

  /**
   * Submit referral via referral link (public endpoint)
   * Note: This method is kept for compatibility, but FormData should be used directly
   * when files are included (see frontend page implementation)
   */
  async submitReferral(
    token: string,
    data: {
      accessCode: string
      patientFirstName: string
      patientLastName: string
      patientDob?: string
      insurance?: string
      gpClinicName: string
      submittedByName: string
      submittedByPhone?: string
      reasonForReferral: string
      notes?: string
    }
  ): Promise<{ referralId: string }> {
    const response = await api.post<ApiResponse<{ referralId: string }>>(
      `/public/referral-link/${token}/submit`,
      data
    )
    return response.data.data
  },
}

