'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Select, LoadingState, Modal } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { specialistService, referralService } from '@/services/api'
import { MapPin, Phone, Building2, Info, Search, User, Check } from 'lucide-react'
import type { Specialist } from '@/types'
import { InteractiveToothChart } from './InteractiveToothChart'
import { FileUpload } from './FileUpload'
import { ReferralReasonButtons } from './ReferralReasonButtons'

interface NewReferralFormProps {
  onCancel?: () => void
  onSuccess?: () => void
}

type ReferralUrgency = 'ROUTINE' | 'URGENT' | 'EMERGENCY'

interface FormData {
  referringDoctorFirstName: string
  referringDoctorLastName: string

  patientFirstName: string
  patientLastName: string
  patientPhone: string
  patientEmail: string
  patientDob: string
  patientAddress: string
  textPatientCopy: boolean

  specialistUserId: string
  reasons: string[]
  customReason: string
  urgency: ReferralUrgency
  notes: string

  selectedTeeth: string[]
  files: File[]
}

function getSpecialistsList(payload: any): Specialist[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload as Specialist[]
  if (Array.isArray(payload.specialists)) return payload.specialists as Specialist[]
  if (payload.data && Array.isArray(payload.data.specialists)) return payload.data.specialists as Specialist[]
  return []
}

export function NewReferralForm({ onCancel, onSuccess }: NewReferralFormProps) {
  const { user } = useAuth()
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [loadingSpecialists, setLoadingSpecialists] = useState(false)
  const [showAdditionalPatientInfo, setShowAdditionalPatientInfo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSpecialistSelector, setShowSpecialistSelector] = useState(false)
  const [specialistSearchQuery, setSpecialistSearchQuery] = useState('')
  const [specialistDropdownValue, setSpecialistDropdownValue] = useState('')

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
    specialistUserId: '',
    reasons: [],
    customReason: '',
    urgency: 'ROUTINE',
    notes: '',
    selectedTeeth: [],
    files: [],
  })

  useEffect(() => {
    loadSpecialists()
  }, [])

  const loadSpecialists = async () => {
    try {
      setLoadingSpecialists(true)
      const response = await specialistService.getDirectory({ limit: 200 })
      const list = getSpecialistsList(response)
      setSpecialists(list)
    } catch (error) {
      console.error('Failed to load specialists:', error)
    } finally {
      setLoadingSpecialists(false)
    }
  }

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleTeethSelection = (teeth: string[]) => {
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
    if (!formData.specialistUserId) {
      newErrors.specialistUserId = 'Please select a specialist to refer to'
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
      const referralData = {
        specialistUserId: formData.specialistUserId,
        patientFirstName: formData.patientFirstName,
        patientLastName: formData.patientLastName,
        patientDob: formData.patientDob || new Date().toISOString(),
        patientPhone: formData.patientPhone || undefined,
        patientEmail: formData.patientEmail || undefined,
        insurance: undefined,
        reason: [formData.reasons.join('; '), formData.customReason.trim()]
          .filter(Boolean)
          .join(' | '),
        urgency: formData.urgency,
        selectedTeeth: formData.selectedTeeth,
        notes: formData.notes || undefined,
        status: saveAsDraft ? 'DRAFT' : 'SUBMITTED',
      } as const

      await referralService.createReferral(referralData)

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
        specialistUserId: '',
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
      onCancel?.()
    } catch (error) {
      console.error('Failed to create referral:', error)
      alert('Failed to create referral. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const clinic = user?.clinic
  const selectedSpecialist = specialists.find(s => s.id === formData.specialistUserId)
  const specialistLabel = selectedSpecialist?.specialistProfile?.specialty || selectedSpecialist?.clinic?.name || 'Specialist'
  const specialistOptions = [
    { value: '', label: 'All specialists' },
    ...specialists.map((specialist) => ({
      value: specialist.id,
      label: specialist.clinic?.name
        ? `${specialist.name} • ${specialist.clinic.name}`
        : specialist.name,
    })),
  ]

  return (
    <div className="space-y-10">
      {clinic && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-16 w-16 rounded-2xl border border-neutral-200 bg-white flex items-center justify-center overflow-hidden shadow-sm">
              <img src="/logo.png" alt="Clinic Logo" className="h-10 w-10 object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{clinic.name}</h3>
              {clinic.address && (
                <div className="flex items-center justify-center gap-2 text-gray-600 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{clinic.address}</span>
                </div>
              )}
              {clinic.phone && (
                <div className="flex items-center justify-center gap-2 text-gray-600 mt-1">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{clinic.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-900">
              Sending referral to <span className="text-red-500">*</span>
            </label>
            {formData.specialistUserId ? (
              <button
                type="button"
                onClick={() => setShowSpecialistSelector(true)}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Change
              </button>
            ) : (
              <span className="text-sm text-neutral-400">Search or select a specialist</span>
            )}
          </div>

          {formData.specialistUserId ? (
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              {selectedSpecialist && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-gray-900 truncate">
                      {selectedSpecialist.name}
                    </h4>
                    <p className="text-sm text-gray-600">{specialistLabel}</p>
                    <div className="flex items-center gap-4 mt-1">
                      {selectedSpecialist.clinic?.phone && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="w-3 h-3" />
                          <span>{selectedSpecialist.clinic.phone}</span>
                        </div>
                      )}
                      {selectedSpecialist.email && (
                        <div className="text-xs text-gray-500 truncate">
                          {selectedSpecialist.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSpecialistSelector(true)}
                      className="px-3 py-1.5 text-sm font-normal rounded-full border border-neutral-200 bg-white text-gray-600 hover:border-emerald-500 hover:bg-emerald-50"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('specialistUserId', '')
                        setShowSpecialistSelector(true)
                      }}
                      className="px-3 py-1.5 text-sm font-normal rounded-full border border-neutral-200 bg-white text-gray-600 hover:border-emerald-500 hover:bg-emerald-50"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 border-dashed">
              <p className="text-sm text-gray-500">No specialist selected. Use the search or dropdown below.</p>
            </div>
          )}

          {(!formData.specialistUserId || showSpecialistSelector) && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-4 space-y-3 max-h-96 overflow-hidden flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 relative">
                  <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search specialist or clinic..."
                    value={specialistSearchQuery}
                    onChange={(e) => setSpecialistSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
                <Select
                  value={specialistDropdownValue}
                  onChange={(e) => setSpecialistDropdownValue(e.target.value)}
                  options={specialistOptions}
                />
              </div>
              <div className="overflow-y-auto flex-1 space-y-2 max-h-52">
                {loadingSpecialists ? (
                  <LoadingState
                    className="py-8"
                    title="Loading specialists..."
                    subtitle="Searching your directory"
                  />
                ) : (() => {
                  const query = specialistSearchQuery.toLowerCase()
                  const filteredSpecialists = specialists
                    .filter((specialist) =>
                      specialist.name.toLowerCase().includes(query) ||
                      (specialist.clinic?.name || '').toLowerCase().includes(query) ||
                      (specialist.specialistProfile?.specialty || '').toLowerCase().includes(query)
                    )
                    .filter((specialist) =>
                      specialistDropdownValue ? specialist.id === specialistDropdownValue : true
                    )

                  if (filteredSpecialists.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        {specialistSearchQuery ? 'No specialists found matching your search.' : 'No specialists available yet.'}
                      </div>
                    )
                  }

                  return filteredSpecialists.map((specialist) => (
                    <button
                      key={specialist.id}
                      type="button"
                      onClick={() => {
                        handleChange('specialistUserId', specialist.id)
                        setSpecialistSearchQuery('')
                        setSpecialistDropdownValue('')
                        setShowSpecialistSelector(false)
                        if (errors.specialistUserId) {
                          setErrors(prev => ({ ...prev, specialistUserId: '' }))
                        }
                      }}
                      className={`w-full text-left p-3 rounded-lg border border-neutral-200 transition-colors ${
                        formData.specialistUserId === specialist.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-700 font-medium text-sm">
                            {specialist.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {specialist.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {specialist.specialistProfile?.specialty || specialist.clinic?.name || 'Specialist'}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            {specialist.clinic?.phone && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Phone className="w-3 h-3" />
                                <span>{specialist.clinic.phone}</span>
                              </div>
                            )}
                            {specialist.email && (
                              <div className="text-xs text-gray-500 truncate">
                                {specialist.email}
                              </div>
                            )}
                          </div>
                        </div>
                        {formData.specialistUserId === specialist.id && (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                })()}
              </div>
              {formData.specialistUserId && (
                <div className="pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowSpecialistSelector(false)}
                    className="w-full px-3 py-1.5 text-sm font-normal rounded-full border border-neutral-200 bg-white text-gray-600 hover:border-emerald-500 hover:bg-emerald-50"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            <ReferralReasonButtons
              selectedReasons={formData.reasons}
              customReason={formData.customReason}
              onReasonToggle={handleReasonToggle}
              onCustomReasonChange={(value) => handleChange('customReason', value)}
              error={errors.reason}
              specialty={selectedSpecialist?.specialistProfile?.specialty}
              showCustomReason={false}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Additional Comments
              </label>
              <textarea
                value={formData.customReason}
                onChange={(e) => handleChange('customReason', e.target.value)}
                rows={6}
                placeholder="Enter custom reason for referral..."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.reason ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
              />
              {errors.reason && (
                <p className="text-sm text-red-600">{errors.reason}</p>
              )}
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <InteractiveToothChart
              selectedTeeth={formData.selectedTeeth}
              onTeethChange={handleTeethSelection}
              className="scale-[0.95] origin-top"
            />
          </div>
        </div>

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

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onCancel}
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
  )
}

interface NewReferralModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function NewReferralModal({ isOpen, onClose, onSuccess }: NewReferralModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
    >
      <NewReferralForm onCancel={onClose} onSuccess={onSuccess} />
    </Modal>
  )
}
