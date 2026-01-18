'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button, Input, Select } from '@/components/ui'
import { DENTAL_SPECIALTIES } from '@/constants'

interface ContactFormData {
  firstName: string
  lastName: string
  specialty: string
  email: string
  phone: string
  fax?: string
  website?: string
  clinicName?: string
  street?: string
  city?: string
  state?: string
  zip?: string
  notes?: string
}

interface ContactFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ContactFormData) => void
  initialData?: ContactFormData
  isLoading?: boolean
}

export function ContactFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  isLoading = false 
}: ContactFormModalProps) {
  const [formData, setFormData] = useState<ContactFormData>(
    initialData || {
      firstName: '',
      lastName: '',
      specialty: '',
      email: '',
      phone: '',
      fax: '',
      website: '',
      clinicName: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      notes: '',
    }
  )

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({})

  // Update form when initialData changes (for editing)
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(initialData)
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        firstName: '',
        lastName: '',
        specialty: '',
        email: '',
        phone: '',
        fax: '',
        website: '',
        clinicName: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        notes: '',
      })
      setErrors({})
    }
  }, [initialData, isOpen])

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.specialty) newErrors.specialty = 'Specialty is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        firstName: '',
        lastName: '',
        specialty: '',
        email: '',
        phone: '',
        fax: '',
        website: '',
        clinicName: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        notes: '',
      })
      setErrors({})
      onClose()
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={initialData ? 'Edit Contact' : 'Add New Contact'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h4 className="text-lg font-semibold text-neutral-700 mb-4">Personal Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={errors.firstName}
              placeholder="John"
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={errors.lastName}
              placeholder="Smith"
              required
            />
          </div>
          
          <div className="mt-4">
            <Select
              label="Specialty"
              value={formData.specialty}
              onChange={(e) => handleChange('specialty', e.target.value)}
              error={errors.specialty}
              required
              options={[
                { value: '', label: 'Select a specialty' },
                ...DENTAL_SPECIALTIES.map(s => ({ value: s, label: s }))
              ]}
            />
          </div>
        </div>

        {/* Contact Details */}
        <div>
          <h4 className="text-lg font-semibold text-neutral-700 mb-4">Contact Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              placeholder="john.smith@email.com"
              required
            />
            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
              placeholder="(555) 123-4567"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Input
              label="Fax (Optional)"
              type="tel"
              value={formData.fax}
              onChange={(e) => handleChange('fax', e.target.value)}
              placeholder="(555) 123-4568"
            />
            <Input
              label="Website (Optional)"
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        </div>

        {/* Practice Information */}
        <div>
          <h4 className="text-lg font-semibold text-neutral-700 mb-4">Practice Information</h4>
          <Input
            label="Clinic/Practice Name (Optional)"
            value={formData.clinicName}
            onChange={(e) => handleChange('clinicName', e.target.value)}
            placeholder="Smith Dental Clinic"
          />
          
          <div className="mt-4">
            <Input
              label="Street Address (Optional)"
              value={formData.street}
              onChange={(e) => handleChange('street', e.target.value)}
              placeholder="123 Main Street"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="New York"
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="NY"
              maxLength={2}
            />
            <Input
              label="ZIP Code"
              value={formData.zip}
              onChange={(e) => handleChange('zip', e.target.value)}
              placeholder="10001"
              maxLength={10}
            />
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h4 className="text-lg font-semibold text-neutral-700 mb-4">Additional Information</h4>
          <div>
            <label className="block text-[10pt] text-neutral-400 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Add any additional notes about this contact..."
              className="cursor-pointer w-full px-3 py-2 border border-neutral-200 text-[10pt] rounded-lg shadow-sm focus:ring-0 focus:outline-none focus:border-neutral-500 resize-none"
            />
            <p className="text-xs text-neutral-500 mt-1">
              {formData.notes?.length || 0}/500 characters
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm font-normal rounded-full border border-neutral-200 bg-white text-gray-600 hover:border-emerald-500 hover:bg-emerald-50"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isLoading}
            className="px-3 py-1.5 text-sm font-normal rounded-full border border-neutral-200 bg-emerald-600 text-white hover:border-emerald-600 hover:bg-emerald-600"
          >
            {initialData ? 'Update Contact' : 'Add Contact'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

