'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { ContactFormModal } from '@/components/contacts/ContactFormModal'
import { contactsService } from '@/services/contacts.service'
import { formatPhoneNumber } from '@/lib/utils'
import { USE_MOCK_DATA } from '@/constants'
import type { Contact } from '@/types'

// Mock contacts data for development
const mockContacts: Contact[] = [
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

export default function ContactsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  // Load contacts from API
  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)

      if (USE_MOCK_DATA) {
        // Use mock data for development
        let filteredContacts = mockContacts

        // Apply search filter if present
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          filteredContacts = filteredContacts.filter(contact =>
            contact.name.toLowerCase().includes(query) ||
            contact.email.toLowerCase().includes(query) ||
            contact.specialty.toLowerCase().includes(query) ||
            contact.phone.includes(query)
          )
        }

        // Sort by name alphabetically
        filteredContacts = filteredContacts.sort((a, b) => a.name.localeCompare(b.name))

        setContacts(filteredContacts)
        console.log('Using mock contacts data:', filteredContacts.length, 'contacts')
      } else {
        // Use real API
        const response = await contactsService.getAll({ limit: 100 })
        console.log('Contacts API response:', response)
        setContacts(response.data || [])
      }
    } catch (error: any) {
      console.error('Failed to load contacts:', error)
      console.error('Error details:', error.response?.data || error.message)
      // Show empty list if API fails
      setContacts([])
      alert(`Failed to load contacts: ${error.response?.data?.message || error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddContact = async (formData: any) => {
    try {
      const contactData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        specialty: formData.specialty,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.street ? `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`.trim() : undefined,
        notes: formData.notes?.trim() || undefined,
      }
      
      console.log('Creating contact with data:', contactData)
      
      if (editingContact) {
        // Update existing contact
        const updated = await contactsService.update(editingContact.id, contactData)
        console.log('Contact updated:', updated)
        setSuccessMessage('Contact updated successfully!')
      } else {
        // Create new contact
        const created = await contactsService.create(contactData)
        console.log('Contact created:', created)
        setSuccessMessage('Contact added successfully!')
      }
      
      // Reload contacts from API
      await loadContacts()
      
      setIsModalOpen(false)
      setEditingContact(null)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Failed to save contact:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      console.error('Error details:', error.response?.data)
      alert(`Failed to save contact: ${errorMessage}`)
    }
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingContact(null)
  }

  const handleDeleteContact = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactsService.delete(id)
        await loadContacts() // Reload contacts
        setSuccessMessage('Contact deleted successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (error) {
        console.error('Failed to delete contact:', error)
        alert('Failed to delete contact. Please try again.')
      }
    }
  }

  // Convert contact to form data for editing
  const getInitialFormData = (contact: Contact) => {
    const nameParts = contact.name.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    
    // Parse address if exists
    const addressParts = contact.address?.split(', ') || []
    const street = addressParts[0] || ''
    const city = addressParts[1] || ''
    const stateZip = addressParts[2]?.split(' ') || []
    const state = stateZip[0] || ''
    const zip = stateZip[1] || ''
    
    return {
      firstName,
      lastName,
      specialty: contact.specialty,
      email: contact.email,
      phone: contact.phone,
      street,
      city,
      state,
      zip,
      notes: contact.notes,
    }
  }

  return (
    <DashboardLayout title="Contacts">
      <div className="space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="text-emerald-600 hover:text-emerald-800">
              ×
            </button>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cursor-pointer w-full pl-10 pr-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-100 bg-white text-sm text-neutral-700 placeholder-neutral-400 transition-colors"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-sm text-white rounded-full hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Add Contact
          </button>
        </div>

        {/* Contacts Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400"></div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                <p>No contacts found</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                        Specialty
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-neutral-400 tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-black/5">
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-neutral-50 cursor-pointer transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-neutral-400 font-medium text-sm">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-neutral-800">
                                {contact.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-700">
                          {contact.specialty}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-700">
                          {contact.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-700">
                          {formatPhoneNumber(contact.phone)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={contact.status === 'ACTIVE' ? 'success' : 'default'}>
                            {contact.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleEditContact(contact)}
                              className="p-2 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
                              title="Edit contact"
                            >
                              <Edit className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => handleDeleteContact(contact.id)}
                              className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete contact"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Contact Modal */}
        <ContactFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleAddContact}
          initialData={editingContact ? getInitialFormData(editingContact) : undefined}
        />
      </div>
    </DashboardLayout>
  )
}

