'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, Input, Select, Button, LoadingState } from '@/components/ui'
import { FileUpload } from '@/components/referrals/FileUpload'
import { ReferralReasonButtons } from '@/components/referrals/ReferralReasonButtons'
import { InteractiveToothChart } from '@/components/referrals/InteractiveToothChart'
import { api, API_URL } from '@/lib/api'
import { CheckCircle, AlertCircle, MapPin, Phone, Info } from 'lucide-react'

interface LinkInfo {
  token: string
  label?: string
  clinicName: string
  clinicAddress?: string
  clinicPhone?: string
  clinicEmail?: string
  clinicLogoUrl?: string
  specialistName: string
  specialty?: string
}

export default function ReferMagicPage() {
  const params = useParams()
  const token = params.token as string
  
  const [linkInfo, setLinkInfo] = useState<LinkInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [showAdditionalPatientInfo, setShowAdditionalPatientInfo] = useState(false)
  const [formData, setFormData] = useState({
    // GP/Submitter information
    gpClinicName: '',
    submittedByName: '',
    submittedByEmail: '',
    submittedByPhone: '',
    // Patient information
    patientFirstName: '',
    patientLastName: '',
    patientDob: '',
    patientPhone: '',
    insurance: '',
    patientSmsOptInConfirmed: false,
    // Referral details
    reasonForReferral: [] as string[],
    customReason: '',
    notes: '',
    urgency: 'ROUTINE',
    selectedTeeth: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resolveLogoUrl = (url?: string) => {
    if (!url) return ''
    if (url.startsWith('/')) {
      return `${API_URL.replace('/api', '')}${url}`
    }
    return url
  }

  // Fetch link info
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const fetchLinkInfo = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get<{ success: boolean; data: LinkInfo }>(`/public/referral-link/${token}`)
        if (response.data.success && response.data.data) {
          setLinkInfo(response.data.data)
        } else {
          setError('Referral link not found')
        }
      } catch (error: any) {
        console.error('Failed to load referral link:', error)
        setError(error.response?.data?.message || 'Failed to load referral link information')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchLinkInfo()
    }
  }, [token])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.gpClinicName.trim()) newErrors.gpClinicName = 'GP clinic name is required'
    if (!formData.submittedByName.trim()) newErrors.submittedByName = 'Your name is required'
    if (!formData.submittedByEmail.trim()) newErrors.submittedByEmail = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.submittedByEmail.trim())) {
      newErrors.submittedByEmail = 'Please enter a valid email address'
    }
    if (!formData.patientFirstName.trim()) newErrors.patientFirstName = 'Patient first name is required'
    if (!formData.patientLastName.trim()) newErrors.patientLastName = 'Patient last name is required'
    if (formData.reasonForReferral.length === 0 && !formData.customReason.trim()) {
      newErrors.reasonForReferral = 'Reason for referral is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTeethSelection = (teeth: string[]) => {
    setFormData(prev => ({ ...prev, selectedTeeth: teeth }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    if (!linkInfo) {
      setError('Referral link information not loaded')
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      // Create FormData to support file uploads
      const formDataToSend = new FormData()
      formDataToSend.append('patientFirstName', formData.patientFirstName.trim())
      formDataToSend.append('patientLastName', formData.patientLastName.trim())
      formDataToSend.append('gpClinicName', formData.gpClinicName.trim())
      formDataToSend.append('submittedByName', formData.submittedByName.trim())
      formDataToSend.append('submittedByEmail', formData.submittedByEmail.trim())
      const reasonSelection = formData.reasonForReferral.join('; ')
      const reasonValue = [reasonSelection, formData.customReason.trim()]
        .filter(Boolean)
        .join(' | ')
      formDataToSend.append('reasonForReferral', reasonValue)
      formDataToSend.append('urgency', formData.urgency)
      
      if (formData.patientDob) {
        formDataToSend.append('patientDob', formData.patientDob)
      }
      if (formData.patientPhone?.trim()) {
        formDataToSend.append('patientPhone', formData.patientPhone.trim())
      }
      if (formData.insurance?.trim()) {
        formDataToSend.append('insurance', formData.insurance.trim())
      }
      if (formData.submittedByPhone?.trim()) {
        formDataToSend.append('submittedByPhone', formData.submittedByPhone.trim())
      }
      if (formData.notes?.trim()) {
        formDataToSend.append('notes', formData.notes.trim())
      }
      if (formData.selectedTeeth.length > 0) {
        formDataToSend.append('selectedTeeth', JSON.stringify(formData.selectedTeeth))
      }
      
      // Append files
      files.forEach((file) => {
        formDataToSend.append('files', file)
      })

      const response = await api.post(
        `/public/referral-link/${token}/submit`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      
      if (response.data.success) {
        setSubmitted(true)
      } else {
        throw new Error(response.data.message || 'Failed to submit referral')
      }
    } catch (error: any) {
      console.error('Failed to submit referral:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit referral. Please try again.'
      setErrors({ submit: errorMessage })
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md border border-gray-200">
          <CardContent className="p-6 text-center">
            <LoadingState
              title="Loading referral form..."
              subtitle="Getting the link details"
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !linkInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md border border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Referral Link Not Found</h1>
            <p className="text-gray-600 mb-4">
              {error || 'The referral link you are trying to access is invalid or inactive.'}
            </p>
            <p className="text-sm text-gray-500">
              Please contact the clinic directly or check the link and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md border border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Referral Submitted!</h1>
            <p className="text-gray-600 mb-4">
              Your referral has been successfully sent to {linkInfo.clinicName}.
            </p>
            <p className="text-sm text-gray-500">
              They will review and respond to your referral shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Referral form
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Clinic Header */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-16 w-16 rounded-2xl border border-neutral-200 bg-white flex items-center justify-center overflow-hidden shadow-sm">
              {linkInfo.clinicLogoUrl ? (
                <img
                  src={resolveLogoUrl(linkInfo.clinicLogoUrl)}
                  alt={`${linkInfo.clinicName} logo`}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <div className="text-sm font-semibold text-gray-400">Logo</div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{linkInfo.clinicName}</h3>
              {linkInfo.clinicAddress && (
                <div className="flex items-center justify-center gap-2 text-gray-600 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{linkInfo.clinicAddress}</span>
                </div>
              )}
              {linkInfo.clinicPhone && (
                <div className="flex items-center justify-center gap-2 text-gray-600 mt-1">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{linkInfo.clinicPhone}</span>
                </div>
              )}
              {(linkInfo.specialistName || linkInfo.specialty) && (
                <div className="text-sm text-gray-500 mt-2">
                  {linkInfo.specialistName && <span>Specialist: {linkInfo.specialistName}</span>}
                  {linkInfo.specialistName && linkInfo.specialty && <span className="mx-2">•</span>}
                  {linkInfo.specialty && <span>Specialty: {linkInfo.specialty}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Referring Doctor */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold text-gray-900">Referring doctor</h4>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                      Enter the clinic and referring dentist information
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Clinic Name"
                    value={formData.gpClinicName}
                    onChange={(e) => handleChange('gpClinicName', e.target.value)}
                    error={errors.gpClinicName}
                    placeholder="ABC Dental Clinic"
                    required
                  />
                  <Input
                    label="Referring Dentist"
                    value={formData.submittedByName}
                    onChange={(e) => handleChange('submittedByName', e.target.value)}
                    error={errors.submittedByName}
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    value={formData.submittedByEmail}
                    onChange={(e) => handleChange('submittedByEmail', e.target.value)}
                    error={errors.submittedByEmail}
                    placeholder="your.email@example.com"
                    required
                  />
                  <Input
                    label="Phone (Optional)"
                    type="tel"
                    value={formData.submittedByPhone}
                    onChange={(e) => handleChange('submittedByPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Patient Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Patient information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={formData.patientFirstName}
                    onChange={(e) => handleChange('patientFirstName', e.target.value)}
                    error={errors.patientFirstName}
                    placeholder="John"
                    required
                  />
                  <Input
                    label="Last Name"
                    value={formData.patientLastName}
                    onChange={(e) => handleChange('patientLastName', e.target.value)}
                    error={errors.patientLastName}
                    placeholder="Doe"
                    required
                  />
                </div>
                <div className="relative">
                  <Input
                    label="Phone (Optional)"
                    type="tel"
                    value={formData.patientPhone}
                    onChange={(e) => handleChange('patientPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                  <div className="absolute right-3 top-9 group">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="hidden group-hover:block absolute right-0 top-full mt-1 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                      Patient&apos;s contact phone number
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="patientSmsOptInConfirmed"
                    checked={formData.patientSmsOptInConfirmed}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setFormData(prev => ({ ...prev, patientSmsOptInConfirmed: checked }))
                      if (errors.patientSmsOptInConfirmed) {
                        setErrors(prev => ({ ...prev, patientSmsOptInConfirmed: '' }))
                      }
                    }}
                    className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="patientSmsOptInConfirmed" className="text-sm text-gray-700">
                    I confirm the patient opted-in to receive SMS/text messages for this referral. Message and data rates may apply. Reply STOP to end.
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-4 bg-gray-50 rounded-lg">
                    <Input
                      label="Date of Birth (Optional)"
                      type="date"
                      value={formData.patientDob}
                      onChange={(e) => handleChange('patientDob', e.target.value)}
                    />
                    <Input
                      label="Insurance (Optional)"
                      value={formData.insurance}
                      onChange={(e) => handleChange('insurance', e.target.value)}
                      placeholder="Insurance provider"
                    />
                  </div>
                )}
              </div>

              {/* Referral Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                  <ReferralReasonButtons
                    selectedReasons={formData.reasonForReferral}
                    customReason={formData.customReason}
                    onReasonToggle={(reason) => {
                      setFormData(prev => ({
                        ...prev,
                        reasonForReferral: prev.reasonForReferral.includes(reason)
                          ? prev.reasonForReferral.filter(item => item !== reason)
                          : [...prev.reasonForReferral, reason]
                      }))
                      if (errors.reasonForReferral) {
                        setErrors(prev => ({ ...prev, reasonForReferral: '' }))
                      }
                    }}
                    onCustomReasonChange={(value) => handleChange('customReason', value)}
                    error={errors.reasonForReferral}
                    specialty={linkInfo.specialty}
                    showPreferredDoctor={false}
                  />
                </div>
                <div className="flex justify-center lg:justify-end">
                  <InteractiveToothChart
                    selectedTeeth={formData.selectedTeeth}
                    onTeethChange={handleTeethSelection}
                    variant="light"
                    className="scale-[0.95] origin-top"
                  />
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Attachments (Optional)
                </label>
                <FileUpload files={files} onFilesChange={setFiles} />
                <p className="text-xs text-gray-500">
                  Upload X-rays, photos, or other relevant patient documents. Max 10MB per file.
                </p>
              </div>

              {/* Urgency + Notes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Additional notes or comments..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.notes?.length || 0}/500 characters
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-gray-200">
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    Once you submit the referral, you will get an email from {linkInfo.clinicName} for patient status.
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                  isLoading={isSubmitting}
                >
                  Submit Referral
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-sm text-neutral-400">
          This is a secure referral submission form. Your information will only be shared with {linkInfo.clinicName}.
        </p>
      </div>
    </div>
  )
}
