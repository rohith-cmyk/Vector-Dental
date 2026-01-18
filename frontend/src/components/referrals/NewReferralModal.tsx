'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui'
import { Button, Input, Select, LoadingState } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { contactsService } from '@/services/contacts.service'
import { referralsService } from '@/services/referrals.service'
import { MapPin, Phone, Building2, Info, X, Upload, Search, User, Check } from 'lucide-react'
import type { Contact, ReferralUrgency } from '@/types'
import { TeethDiagram } from './TeethDiagram'
import { FileUpload } from './FileUpload'
import { ReferralReasonButtons } from './ReferralReasonButtons'

interface NewReferralModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  // Referring doctor
  referringDoctorFirstName: string
  referringDoctorLastName: string

  // Patient information
  patientFirstName: string
  patientLastName: string
  patientPhone: string
  patientEmail: string
  patientDob: string
  patientAddress: string
  textPatientCopy: boolean

  // Referral details
  toContactId: string
  reasons: string[]
  customReason: string
  urgency: ReferralUrgency
  notes: string

  // Teeth selection
  selectedTeeth: Array<string | number>

  // Files
  files: File[]
}

export function NewReferralModal({ isOpen, onClose, onSuccess }: NewReferralModalProps) {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [showAdditionalPatientInfo, setShowAdditionalPatientInfo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showContactSelector, setShowContactSelector] = useState(false)
  const [contactSearchQuery, setContactSearchQuery] = useState('')

  const [formData, setFormData] = useState<FormData>({
    referringDoctorFirstName: user?.name?.split(' ')[0] || '',
    referringDoctorLastName: user?.name?.split(' ').slice(1).join(' ') || '',
    patientFirstName: '',
    patientLastName: '',
    patientPhone: '',
    patientEmail: '',
    patientDob: '',
    patientAddress: '',
    textPatientCopy: false,
    toContactId: '',
    reasons: [],
    customReason: '',
    urgency: 'ROUTINE',
    notes: '',
    selectedTeeth: [],
    files: [],
  })

  // Fetch contacts on mount
  useEffect(() => {
    if (isOpen) {
      loadContacts()
    }
  }, [isOpen])

  const loadContacts = async () => {
    try {
      setLoadingContacts(true)
      const response = await contactsService.getAll({ limit: 100, status: 'ACTIVE' })
      setContacts(response.data)
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setLoadingContacts(false)
    }
  }

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleTeethSelection = (teeth: Array<string | number>) => {
    handleChange('selectedTeeth', teeth)
  }

  const handleFileUpload = (files: File[]) => {
    handleChange('files', files)
  }

  const handleReasonToggle = (reason: string) => {
    setFormData((prev) => ({
      ...prev,
      reasons: prev.reasons.includes(reason)
        ? prev.reasons.filter(item => item !== reason)
        : [...prev.reasons, reason],
    }))
    if (errors.reason) {
      setErrors(prev => ({ ...prev, reason: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.referringDoctorFirstName.trim()) {
      newErrors.referringDoctorFirstName = 'First name is required'
    }
    if (!formData.referringDoctorLastName.trim()) {
      newErrors.referringDoctorLastName = 'Last name is required'
    }
    if (!formData.patientFirstName.trim()) {
      newErrors.patientFirstName = 'Patient first name is required'
    }
    if (!formData.patientLastName.trim()) {
      newErrors.patientLastName = 'Patient last name is required'
    }
    if (!formData.patientPhone.trim()) {
      newErrors.patientPhone = 'Patient phone is required'
    }
    if (!formData.toContactId) {
      newErrors.toContactId = 'Please select a clinic/contact to refer to'
    }
    if (formData.reasons.length === 0 && !formData.customReason.trim()) {
      newErrors.reason = 'Please select or enter a reason for referral'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (saveAsDraft = false) => {
    if (!validate()) {
      return
    }

    if (!user?.clinicId) {
      alert('No clinic found. Please log in again.')
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare referral data
      const referralData = {
        referralType: 'OUTGOING' as const,
        fromClinicId: user.clinicId,
        toContactId: formData.toContactId,
        patientName: `${formData.patientFirstName} ${formData.patientLastName}`,
        patientDob: formData.patientDob || new Date().toISOString(),
        patientPhone: formData.patientPhone || undefined,
        patientEmail: formData.patientEmail || undefined,
        reason: [formData.reasons.join('; '), formData.customReason.trim()]
          .filter(Boolean)
          .join(' | '),
        urgency: formData.urgency,
        status: (saveAsDraft ? 'DRAFT' : 'SENT') as import('@/types').ReferralStatus,
        notes: formData.notes || undefined,
        // TODO: Add teeth and files once backend supports them
        // selectedTeeth: formData.selectedTeeth,
        // files: formData.files,
      }

      await referralsService.create(referralData)

      // Reset form
      setFormData({
        referringDoctorFirstName: user?.name?.split(' ')[0] || '',
        referringDoctorLastName: user?.name?.split(' ').slice(1).join(' ') || '',
        patientFirstName: '',
        patientLastName: '',
        patientPhone: '',
        patientEmail: '',
        patientDob: '',
        patientAddress: '',
        textPatientCopy: false,
        toContactId: '',
        reasons: [],
        customReason: '',
        urgency: 'ROUTINE',
        notes: '',
        selectedTeeth: [],
        files: [],
      })
      setErrors({})
      setShowAdditionalPatientInfo(false)

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to create referral:', error)
      alert('Failed to create referral. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const clinic = user?.clinic

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
    >
      <div className="space-y-10">
        {/* Clinic Information Header */}
        {clinic && (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {clinic.name}
                  </h3>
                  {clinic.address && (
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{clinic.address}</span>
                    </div>
                  )}
                  {clinic.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{clinic.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Contact/Doctor Selector - Top Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-900">
              Sending referral to <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowContactSelector(!showContactSelector)}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {formData.toContactId ? 'Change' : 'Select'}
            </button>
          </div>

          {formData.toContactId ? (
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              {(() => {
                const selectedContact = contacts.find(c => c.id === formData.toContactId)
                if (selectedContact) {
                  return (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-gray-900 truncate">
                          {selectedContact.name}
                        </h4>
                        <p className="text-sm text-gray-600">{selectedContact.specialty}</p>
                        <div className="flex items-center gap-4 mt-1">
                          {selectedContact.phone && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Phone className="w-3 h-3" />
                              <span>{selectedContact.phone}</span>
                            </div>
                          )}
                          {selectedContact.email && (
                            <div className="text-xs text-gray-500 truncate">
                              {selectedContact.email}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleChange('toContactId', '')
                          setShowContactSelector(true)
                        }}
                        className="px-3 py-1.5 text-sm font-normal rounded-full border border-neutral-200 bg-white text-gray-600 hover:border-emerald-500 hover:bg-emerald-50"
                      >
                        Change
                      </button>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 border-dashed">
              <p className="text-sm text-gray-500">No contact selected. Click &quot;Select&quot; to choose a doctor/contact.</p>
            </div>
          )}

          {/* Contact Selector Dropdown */}
          {showContactSelector && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-4 space-y-3 max-h-96 overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 relative">
                <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts by name, specialty, or email..."
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto flex-1 space-y-2">
                {loadingContacts ? (
                  <LoadingState
                    className="py-8"
                    title="Loading contacts..."
                    subtitle="Searching your directory"
                  />
                ) : (() => {
                  const filteredContacts = contacts.filter(contact =>
                    contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
                    contact.specialty.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
                    contact.email.toLowerCase().includes(contactSearchQuery.toLowerCase())
                  )

                  if (filteredContacts.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        {contactSearchQuery ? 'No contacts found matching your search.' : 'No contacts available. Add contacts to send referrals.'}
                      </div>
                    )
                  }

                  return filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => {
                        handleChange('toContactId', contact.id)
                        setShowContactSelector(false)
                        setContactSearchQuery('')
                        if (errors.toContactId) {
                          setErrors(prev => ({ ...prev, toContactId: '' }))
                        }
                      }}
                      className={`w-full text-left p-3 rounded-lg border border-neutral-200 transition-colors ${
                        formData.toContactId === contact.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-700 font-medium text-sm">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {contact.name}
                          </div>
                          <div className="text-xs text-gray-600">{contact.specialty}</div>
                          <div className="flex items-center gap-3 mt-1">
                            {contact.phone && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Phone className="w-3 h-3" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                            {contact.email && (
                              <div className="text-xs text-gray-500 truncate">
                                {contact.email}
                              </div>
                            )}
                          </div>
                        </div>
                        {formData.toContactId === contact.id && (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                })()}
              </div>
              <div className="pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowContactSelector(false)
                    setContactSearchQuery('')
                  }}
                  className="w-full px-3 py-1.5 text-sm font-normal rounded-full border border-neutral-200 bg-white text-gray-600 hover:border-emerald-500 hover:bg-emerald-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Referring Doctor Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold text-gray-900">Referring doctor</h4>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                Enter the name of the dentist making this referral
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.referringDoctorFirstName}
              onChange={(e) => handleChange('referringDoctorFirstName', e.target.value)}
              error={errors.referringDoctorFirstName}
            />
            <Input
              label="Last Name"
              value={formData.referringDoctorLastName}
              onChange={(e) => handleChange('referringDoctorLastName', e.target.value)}
              error={errors.referringDoctorLastName}
            />
          </div>
        </div>

        {/* Patient Information Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Patient information</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.patientFirstName}
              onChange={(e) => handleChange('patientFirstName', e.target.value)}
              error={errors.patientFirstName}
            />
            <Input
              label="Last Name"
              value={formData.patientLastName}
              onChange={(e) => handleChange('patientLastName', e.target.value)}
              error={errors.patientLastName}
            />
          </div>
          <div className="relative">
            <Input
              label="Phone"
              type="tel"
              value={formData.patientPhone}
              onChange={(e) => handleChange('patientPhone', e.target.value)}
              error={errors.patientPhone}
            />
            <div className="absolute right-3 top-9 group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="hidden group-hover:block absolute right-0 top-full mt-1 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                Patient&apos;s contact phone number
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="textPatientCopy"
              checked={formData.textPatientCopy}
              onChange={(e) => handleChange('textPatientCopy', e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="textPatientCopy" className="text-sm text-gray-700 flex items-center gap-1">
              Text patient a copy
              <div className="group relative">
                <Info className="w-3 h-3 text-gray-400 cursor-help" />
                <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                  Send a text message copy to the patient
                </div>
              </div>
            </label>
          </div>
          <button
            type="button"
            onClick={() => setShowAdditionalPatientInfo(!showAdditionalPatientInfo)}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {showAdditionalPatientInfo ? '−' : '+'} Additional patient information
          </button>
          {showAdditionalPatientInfo && (
            <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <Input
                label="Date of Birth"
                type="date"
                value={formData.patientDob}
                onChange={(e) => handleChange('patientDob', e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                value={formData.patientEmail}
                onChange={(e) => handleChange('patientEmail', e.target.value)}
              />
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.patientAddress}
                  onChange={(e) => handleChange('patientAddress', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}
        </div>


        {/* Reason for Referral */}
        <ReferralReasonButtons
          selectedReasons={formData.reasons}
          customReason={formData.customReason}
          onReasonToggle={handleReasonToggle}
          onCustomReasonChange={(value) => handleChange('customReason', value)}
          error={errors.reason}
          specialty={contacts.find(c => c.id === formData.toContactId)?.specialty}
        />

        {/* Teeth Diagram */}
        <div className="space-y-2">
          <TeethDiagram
            selectedTeeth={formData.selectedTeeth}
            onTeethChange={handleTeethSelection}
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Attachments (Optional)
          </label>
          <FileUpload
            files={formData.files}
            onFilesChange={handleFileUpload}
            accept=".jpg,.jpeg,.png,.pdf,.dcm,.dicom"
          />
        </div>

        {/* Urgency and Notes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urgency
            </label>
            <Select
              value={formData.urgency}
              onChange={(e) => handleChange('urgency', e.target.value)}
              options={[
                { value: 'ROUTINE', label: 'Routine' },
                { value: 'URGENT', label: 'Urgent' },
                { value: 'EMERGENCY', label: 'Emergency' },
              ]}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Additional notes or comments..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-sm font-normal rounded-full border border-neutral-200 bg-white text-gray-600 hover:border-emerald-500 hover:bg-emerald-50"
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-sm font-normal rounded-full border border-neutral-200 bg-white text-gray-600 hover:border-emerald-500 hover:bg-emerald-50"
          >
            Save as Draft
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-sm font-normal rounded-full border border-neutral-200 bg-emerald-600 text-white hover:border-emerald-600 hover:bg-emerald-600"
          >
            {isSubmitting ? 'Sending...' : 'Send Referral'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

