'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { ContactFormModal } from '@/components/contacts/ContactFormModal'
import { contactsService } from '@/services/contacts.service'
import { getCachedData, setCachedData } from '@/lib/cache'
import { formatPhoneNumber } from '@/lib/utils'
import type { Contact } from '@/types'

export default function ContactsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const cacheKey = 'contacts_all'
  const cacheTtl = 2 * 60 * 1000

  // Load contacts from API
  useEffect(() => {
    const cached = getCachedData<Contact[]>(cacheKey)
    if (cached) {
      setContacts(cached)
      setLoading(false)
      loadContacts(false)
      return
    }

    loadContacts(true)
  }, [])

  const loadContacts = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      // Request all contacts with a high limit
      const response = await contactsService.getAll({ limit: 100 })
      console.log('Contacts API response:', response)
      setContacts(response.data || [])
      setCachedData(cacheKey, response.data || [], cacheTtl)
    } catch (error: any) {
      console.error('Failed to load contacts:', error)
      console.error('Error details:', error.response?.data || error.message)
      // Show empty list if API fails
      setContacts([])
      alert(`Failed to load contacts: ${error.response?.data?.message || error.message || 'Unknown error'}`)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
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
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800">
              ×
            </button>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <Button 
            variant="primary" 
            className="gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-5 w-5" />
            Add Contact
          </Button>
        </div>

        {/* Contacts Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-gray-500">No contacts found</p>
                <Button variant="primary" className="mt-4 gap-2">
                  <Plus className="h-5 w-5" />
                  Add Your First Contact
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Specialty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                              <span className="text-brand-700 font-medium">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {contact.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {contact.specialty}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {contact.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatPhoneNumber(contact.phone)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={contact.status === 'ACTIVE' ? 'success' : 'default'}>
                            {contact.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEditContact(contact)}
                              className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit contact"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteContact(contact.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete contact"
                            >
                              <Trash2 className="h-4 w-4" />
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

