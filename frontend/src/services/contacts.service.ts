import { api } from '@/lib/api'
import type { Contact, PaginatedResponse } from '@/types'

/**
 * Contacts Service
 */
export const contactsService = {
  /**
   * Get all contacts
   */
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
    specialty?: string
    status?: string
  }): Promise<PaginatedResponse<Contact>> {
    try {
      const response = await api.get<{ success: boolean; data: Contact[]; total: number; page: number; limit: number; totalPages: number }>('/contacts', { params })
      // Handle both response formats
      if (response.data.success && Array.isArray(response.data.data)) {
        return {
          data: response.data.data,
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        }
      }
      // Fallback for direct array response
      return response.data as any
    } catch (error) {
      console.error('Error fetching contacts:', error)
      throw error
    }
  },

  /**
   * Get contact by ID
   */
  async getById(id: string): Promise<Contact> {
    const response = await api.get<Contact>(`/contacts/${id}`)
    return response.data
  },

  /**
   * Create new contact
   */
  async create(data: Partial<Contact>): Promise<Contact> {
    try {
      const response = await api.post<{ success: boolean; data: Contact }>('/contacts', data)
      if (response.data.success && response.data.data) {
        return response.data.data
      }
      return response.data as any
    } catch (error) {
      console.error('Error creating contact:', error)
      throw error
    }
  },

  /**
   * Update contact
   */
  async update(id: string, data: Partial<Contact>): Promise<Contact> {
    try {
      const response = await api.put<{ success: boolean; data: Contact }>(`/contacts/${id}`, data)
      if (response.data.success && response.data.data) {
        return response.data.data
      }
      return response.data as any
    } catch (error) {
      console.error('Error updating contact:', error)
      throw error
    }
  },

  /**
   * Delete contact
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/contacts/${id}`)
  },
}

