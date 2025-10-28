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
    const response = await api.get<PaginatedResponse<Contact>>('/contacts', { params })
    return response.data
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
    const response = await api.post<Contact>('/contacts', data)
    return response.data
  },

  /**
   * Update contact
   */
  async update(id: string, data: Partial<Contact>): Promise<Contact> {
    const response = await api.put<Contact>(`/contacts/${id}`, data)
    return response.data
  },

  /**
   * Delete contact
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/contacts/${id}`)
  },
}

