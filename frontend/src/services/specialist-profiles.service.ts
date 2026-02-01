import { api } from '@/lib/api'
import type { ApiResponse } from '@/types'

export type SpecialistRole = 'Admin' | 'Staff'

export interface SpecialistProfileEntry {
  id: string
  fullName: string
  email: string
  role: SpecialistRole
  credentials: string
  specialty: string
  yearsInPractice: string
  boardCertified: boolean
  photoUrl?: string
  phone: string
  website: string
  address: string
  city: string
  state: string
  zip: string
  languages: string
  subSpecialties: string
  insuranceAccepted: string
}

export interface SpecialistProfilePayload {
  fullName: string
  email: string
  role: SpecialistRole
  credentials?: string
  specialty?: string
  yearsInPractice?: string | number
  boardCertified?: boolean
  phone?: string
  website?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  languages?: string[] | string
  subSpecialties?: string[] | string
  insuranceAccepted?: string[] | string
}

export const specialistProfilesService = {
  async getAll(): Promise<ApiResponse<SpecialistProfileEntry[]>> {
    const response = await api.get<ApiResponse<SpecialistProfileEntry[]>>('/specialist-profiles')
    return response.data
  },

  async create(payload: SpecialistProfilePayload): Promise<ApiResponse<SpecialistProfileEntry>> {
    const response = await api.post<ApiResponse<SpecialistProfileEntry>>('/specialist-profiles', payload)
    return response.data
  },

  async update(id: string, payload: SpecialistProfilePayload): Promise<ApiResponse<SpecialistProfileEntry>> {
    const response = await api.put<ApiResponse<SpecialistProfileEntry>>(`/specialist-profiles/${id}`, payload)
    return response.data
  },

  async remove(id: string): Promise<ApiResponse<{ id: string }>> {
    const response = await api.delete<ApiResponse<{ id: string }>>(`/specialist-profiles/${id}`)
    return response.data
  },

  async uploadPhoto(id: string, file: File): Promise<ApiResponse<SpecialistProfileEntry>> {
    const formData = new FormData()
    formData.append('photo', file)
    const response = await api.post<ApiResponse<SpecialistProfileEntry>>(`/specialist-profiles/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}
