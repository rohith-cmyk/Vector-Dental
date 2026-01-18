import { api } from '@/lib/api'
import { USE_MOCK_DATA } from '@/constants'
import type { Contact, PaginatedResponse } from '@/types'

// Mock contacts storage for development
let mockContactsStorage: Contact[] = [
  {
    id: 'mock-1',
    clinicId: 'clinic1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Orthodontics',
    phone: '(555) 123-4567',
    email: 'sarah.johnson@ortho.com',
    address: '123 Dental Street, Suite 100, New York, NY 10001',
    notes: 'Excellent orthodontist, specializes in Invisalign treatments',
    status: 'ACTIVE',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastAccess: '2024-01-20T14:22:00Z',
  },
  {
    id: 'mock-2',
    clinicId: 'clinic1',
    name: 'Dr. Michael Chen',
    specialty: 'Oral Surgery',
    phone: '(555) 234-5678',
    email: 'michael.chen@oralsurg.com',
    address: '456 Surgery Plaza, Floor 2, New York, NY 10002',
    notes: 'Specializes in wisdom tooth extractions and dental implants',
    status: 'ACTIVE',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-10T09:15:00Z',
    lastAccess: '2024-01-19T11:45:00Z',
  },
  {
    id: 'mock-3',
    clinicId: 'clinic1',
    name: 'Dr. Emily Davis',
    specialty: 'Periodontics',
    phone: '(555) 345-6789',
    email: 'emily.davis@perio.com',
    address: '789 Gum Health Blvd, Suite 300, New York, NY 10003',
    notes: 'Expert in gum disease treatment and dental cleanings',
    status: 'ACTIVE',
    createdAt: '2024-01-08T16:20:00Z',
    updatedAt: '2024-01-08T16:20:00Z',
    lastAccess: '2024-01-18T13:30:00Z',
  },
  {
    id: 'mock-4',
    clinicId: 'clinic1',
    name: 'Dr. Robert Wilson',
    specialty: 'Endodontics',
    phone: '(555) 456-7890',
    email: 'robert.wilson@endo.com',
    address: '321 Root Canal Way, Unit 4, New York, NY 10004',
    notes: 'Specialist in root canal treatments and complex endodontic procedures',
    status: 'ACTIVE',
    createdAt: '2024-01-12T11:45:00Z',
    updatedAt: '2024-01-12T11:45:00Z',
    lastAccess: '2024-01-17T10:15:00Z',
  },
  {
    id: 'mock-5',
    clinicId: 'clinic1',
    name: 'Dr. Lisa Thompson',
    specialty: 'Prosthodontics',
    phone: '(555) 567-8901',
    email: 'lisa.thompson@prostho.com',
    address: '654 Dental Arts Center, Suite 500, New York, NY 10005',
    notes: 'Expert in crowns, bridges, and complete dentures',
    status: 'ACTIVE',
    createdAt: '2024-01-05T14:30:00Z',
    updatedAt: '2024-01-05T14:30:00Z',
    lastAccess: '2024-01-16T15:20:00Z',
  },
  {
    id: 'mock-6',
    clinicId: 'clinic1',
    name: 'Dr. David Brown',
    specialty: 'Pediatric Dentistry',
    phone: '(555) 678-9012',
    email: 'david.brown@pedodent.com',
    address: '987 Kids Dental Lane, Suite 200, New York, NY 10006',
    notes: 'Great with children, specializes in sedation dentistry for kids',
    status: 'ACTIVE',
    createdAt: '2024-01-03T08:00:00Z',
    updatedAt: '2024-01-03T08:00:00Z',
    lastAccess: '2024-01-15T09:45:00Z',
  },
  {
    id: 'mock-7',
    clinicId: 'clinic1',
    name: 'Dr. Amanda Garcia',
    specialty: 'Oral Medicine',
    phone: '(555) 789-0123',
    email: 'amanda.garcia@oralmed.com',
    address: '147 Medical Dental Plaza, Floor 3, New York, NY 10007',
    notes: 'Specializes in oral medicine and complex medical cases',
    status: 'INACTIVE',
    createdAt: '2023-12-20T12:15:00Z',
    updatedAt: '2024-01-02T10:30:00Z',
    lastAccess: '2024-01-02T10:30:00Z',
  },
  {
    id: 'mock-8',
    clinicId: 'clinic1',
    name: 'Dr. Thomas Lee',
    specialty: 'Oral Pathology',
    phone: '(555) 890-1234',
    email: 'thomas.lee@oralpath.com',
    address: '258 Pathology Research Center, Suite 400, New York, NY 10008',
    notes: 'Oral pathology specialist, works with biopsy samples',
    status: 'ACTIVE',
    createdAt: '2024-01-01T13:45:00Z',
    updatedAt: '2024-01-01T13:45:00Z',
    lastAccess: '2024-01-14T16:10:00Z',
  },
  {
    id: 'mock-9',
    clinicId: 'clinic1',
    name: 'Dr. Jennifer White',
    specialty: 'General Dentistry',
    phone: '(555) 901-2345',
    email: 'jennifer.white@general.com',
    address: '369 Family Dental Care, Suite 150, Brooklyn, NY 11201',
    notes: 'General practitioner, excellent for routine checkups and basic procedures',
    status: 'ACTIVE',
    createdAt: '2024-01-07T15:20:00Z',
    updatedAt: '2024-01-07T15:20:00Z',
    lastAccess: '2024-01-13T11:25:00Z',
  },
  {
    id: 'mock-10',
    clinicId: 'clinic1',
    name: 'Dr. Kevin Martinez',
    specialty: 'Orthodontics',
    phone: '(555) 012-3456',
    email: 'kevin.martinez@ortho2.com',
    address: '741 Smile Straight Center, Suite 250, Queens, NY 11385',
    notes: 'Orthodontist specializing in traditional braces, good alternative option',
    status: 'ACTIVE',
    createdAt: '2024-01-14T09:10:00Z',
    updatedAt: '2024-01-14T09:10:00Z',
    lastAccess: '2024-01-12T14:35:00Z',
  },
]

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
    if (USE_MOCK_DATA) {
      // Mock implementation
      let filteredContacts = [...mockContactsStorage]

      // Apply search filter
      if (params?.search) {
        const query = params.search.toLowerCase()
        filteredContacts = filteredContacts.filter(contact =>
          contact.name.toLowerCase().includes(query) ||
          contact.email.toLowerCase().includes(query) ||
          contact.specialty.toLowerCase().includes(query) ||
          contact.phone.includes(query)
        )
      }

      // Apply specialty filter
      if (params?.specialty) {
        filteredContacts = filteredContacts.filter(contact => contact.specialty === params.specialty)
      }

      // Apply status filter
      if (params?.status) {
        filteredContacts = filteredContacts.filter(contact => contact.status === params.status)
      }

      // Sort by name
      filteredContacts.sort((a, b) => a.name.localeCompare(b.name))

      // Apply pagination
      const page = params?.page || 1
      const limit = params?.limit || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedContacts = filteredContacts.slice(startIndex, endIndex)

      return {
        data: paginatedContacts,
        total: filteredContacts.length,
        page,
        limit,
        totalPages: Math.ceil(filteredContacts.length / limit),
      }
    }

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
    if (USE_MOCK_DATA) {
      const contact = mockContactsStorage.find(c => c.id === id)
      if (!contact) {
        throw new Error('Contact not found')
      }
      return contact
    }

    const response = await api.get<Contact>(`/contacts/${id}`)
    return response.data
  },

  /**
   * Create new contact
   */
  async create(data: Partial<Contact>): Promise<Contact> {
    if (USE_MOCK_DATA) {
      const newContact: Contact = {
        id: `mock-${Date.now()}`,
        clinicId: 'clinic1',
        name: data.name || '',
        specialty: data.specialty || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address,
        notes: data.notes,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockContactsStorage.push(newContact)
      return newContact
    }

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
    if (USE_MOCK_DATA) {
      const index = mockContactsStorage.findIndex(c => c.id === id)
      if (index === -1) {
        throw new Error('Contact not found')
      }

      const updatedContact = {
        ...mockContactsStorage[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      mockContactsStorage[index] = updatedContact
      return updatedContact
    }

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
    if (USE_MOCK_DATA) {
      const index = mockContactsStorage.findIndex(c => c.id === id)
      if (index === -1) {
        throw new Error('Contact not found')
      }
      mockContactsStorage.splice(index, 1)
      return
    }

    await api.delete(`/contacts/${id}`)
  },
}

