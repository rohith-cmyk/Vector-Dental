'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, Input, Button } from '@/components/ui'
import { FileUpload } from '@/components/referrals/FileUpload'
import { magicReferralLinkService } from '@/services/magic-referral-link.service'
import { api } from '@/lib/api'
import { CheckCircle, AlertCircle, Key, Loader2 } from 'lucide-react'
import { InteractiveToothChart } from '@/components/referrals/InteractiveToothChart'

interface LinkInfo {
  token: string
  label?: string
  clinicName: string
  clinicAddress?: string
  clinicPhone?: string
  clinicEmail?: string
  specialistName: string
  specialists?: { id: string; name: string; role: string }[]
}

export default function MagicReferralPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [step, setStep] = useState<'access-code' | 'form' | 'success'>('access-code')
  const [linkInfo, setLinkInfo] = useState<LinkInfo | null>(null)
  const [loadingLink, setLoadingLink] = useState(true)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [accessCode, setAccessCode] = useState('')
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([])

  const [formData, setFormData] = useState({
    patientFirstName: '',
    patientLastName: '',
    patientDob: '',
    insurance: '',
    gpClinicName: '',
    submittedByName: '',
    submittedByPhone: '',
    reasonForReferral: '',
    notes: '',
    intendedRecipientId: '',
    specialty: '',
  })

  // List of specialties for categorization
  const SPECIALTIES = [
    'General Dentist',
    'Pedodontist or Pediatric Dentist',
    'Orthodontist',
    'Periodontist or Gum Specialist',
    'Endodontist or Root Canal Specialist',
    'Oral Pathologist or Oral Surgeon',
    'Prosthodontist',
  ]

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch link info on mount
  useEffect(() => {
    const fetchLinkInfo = async () => {
      try {
        setLoadingLink(true)
        setLinkError(null)
        const data = await magicReferralLinkService.getByToken(token)
        setLinkInfo(data as LinkInfo)
      } catch (error: any) {
        console.error('Failed to load referral link:', error)
        setLinkError(
          error.response?.data?.message || 'Referral link not found or is inactive'
        )
      } finally {
        setLoadingLink(false)
      }
    }

    if (token) {
      fetchLinkInfo()
    }
  }, [token])

  const handleAccessCodeChange = (value: string) => {
    setAccessCode(value.replace(/\D/g, '').slice(0, 8))
    setCodeError(null)
  }

  const handleVerifyAccessCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!accessCode || accessCode.length < 4) {
      setCodeError('Please enter a valid access code (4-8 digits)')
      return
    }

    try {
      setVerifyingCode(true)
      setCodeError(null)
      await magicReferralLinkService.verifyAccessCode(token, accessCode)
      setStep('form')
    } catch (error: any) {
      setCodeError(error.response?.data?.message || 'Invalid access code')
    } finally {
      setVerifyingCode(false)
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.patientFirstName.trim()) newErrors.patientFirstName = 'First name is required'
    if (!formData.patientLastName.trim()) newErrors.patientLastName = 'Last name is required'
    if (!formData.patientDob) {
      newErrors.patientDob = 'Date of birth is required'
    } else {
      // Validate date format
      const date = new Date(formData.patientDob)
      if (isNaN(date.getTime())) {
        newErrors.patientDob = 'Please enter a valid date'
      }
    }
    if (!formData.gpClinicName.trim()) newErrors.gpClinicName = 'GP clinic name is required'
    if (!formData.submittedByName.trim())
      newErrors.submittedByName = 'Submitted by name is required'
    if (!formData.reasonForReferral.trim())
      newErrors.reasonForReferral = 'Reason for referral is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSubmitting(true)

      // Create FormData to support file uploads
      const submitFormData = new FormData()
      submitFormData.append('accessCode', accessCode)
      submitFormData.append('patientFirstName', formData.patientFirstName)
      submitFormData.append('patientLastName', formData.patientLastName)
      submitFormData.append('patientDob', formData.patientDob)
      submitFormData.append('gpClinicName', formData.gpClinicName)
      submitFormData.append('submittedByName', formData.submittedByName)
      submitFormData.append('reasonForReferral', formData.reasonForReferral)

      if (formData.insurance) submitFormData.append('insurance', formData.insurance)
      if (formData.submittedByPhone) submitFormData.append('submittedByPhone', formData.submittedByPhone)
      if (formData.notes) submitFormData.append('notes', formData.notes)
      if (formData.intendedRecipientId) submitFormData.append('intendedRecipientId', formData.intendedRecipientId)
      if (formData.specialty) submitFormData.append('specialty', formData.specialty)
      if (selectedTeeth.length > 0) submitFormData.append('selectedTeeth', JSON.stringify(selectedTeeth))

      // Append files
      files.forEach((file) => {
        submitFormData.append('files', file)
      })

      // Submit with FormData (includes files)
      // Submit with FormData (includes files)
      // Note: We need to unset the default application/json content type
      // Setting it to undefined allows the browser to set the regular multipart/form-data with the correct boundary
      await api.post(`/public/referral-link/${token}/submit`, submitFormData, {
        headers: {
          'Content-Type': undefined,
        },
      })

      setStep('success')
    } catch (error: any) {
      console.error('Failed to submit referral:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit referral. Please try again.'
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loadingLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gray-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-brand-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading referral form...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (linkError || !linkInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gray-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Not Found</h1>
            <p className="text-gray-600 mb-4">
              {linkError || 'The referral link you are trying to access is invalid or inactive.'}
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
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gray-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Referral Submitted!</h1>
            <p className="text-gray-600 mb-4">
              Your referral has been successfully sent to {linkInfo.clinicName}.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              They will review and respond to your referral shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Access Code Entry Step
  if (step === 'access-code') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gray-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Logo" className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Secure Referral Submission
            </h1>
            <p className="text-gray-600">
              Refer a patient to <strong>{linkInfo.clinicName}</strong>
            </p>
            {linkInfo.specialistName && (
              <p className="text-sm text-gray-500 mt-1">Dr. {linkInfo.specialistName}</p>
            )}
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 mb-4">
                  <Key className="h-8 w-8 text-brand-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Enter Access Code
                </h2>
                <p className="text-sm text-gray-600">
                  Please enter the access code provided by {linkInfo.clinicName} to continue.
                </p>
              </div>

              <form onSubmit={handleVerifyAccessCode} className="space-y-4">
                <div>
                  <Input
                    label="Access Code"
                    type="text"
                    inputMode="numeric"
                    value={accessCode}
                    onChange={(e) => handleAccessCodeChange(e.target.value)}
                    placeholder="123456"
                    className="text-center text-2xl font-mono tracking-widest"
                    maxLength={8}
                    error={codeError || undefined}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    4-8 digit code
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyingCode || !accessCode || accessCode.length < 4}
                >
                  {verifyingCode ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Referral Form Step
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Refer a Patient to {linkInfo.clinicName}
          </h1>
          {linkInfo.clinicAddress && (
            <p className="text-gray-600">
              {linkInfo.clinicAddress}
              {linkInfo.clinicPhone && ` • ${linkInfo.clinicPhone}`}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Fill out this form to submit your referral
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* GP/Submitter Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="GP Clinic Name"
                    value={formData.gpClinicName}
                    onChange={(e) => handleFormChange('gpClinicName', e.target.value)}
                    error={errors.gpClinicName}
                    placeholder="ABC Dental Clinic"
                    required
                  />
                  <Input
                    label="Your Name"
                    value={formData.submittedByName}
                    onChange={(e) => handleFormChange('submittedByName', e.target.value)}
                    error={errors.submittedByName}
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
                <div className="mt-4">
                  <Input
                    label="Your Phone (Optional)"
                    type="tel"
                    value={formData.submittedByPhone}
                    onChange={(e) => handleFormChange('submittedByPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Patient Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Patient First Name"
                    value={formData.patientFirstName}
                    onChange={(e) => handleFormChange('patientFirstName', e.target.value)}
                    error={errors.patientFirstName}
                    placeholder="John"
                    required
                  />
                  <Input
                    label="Patient Last Name"
                    value={formData.patientLastName}
                    onChange={(e) => handleFormChange('patientLastName', e.target.value)}
                    error={errors.patientLastName}
                    placeholder="Doe"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={formData.patientDob}
                    onChange={(e) => handleFormChange('patientDob', e.target.value)}
                    error={errors.patientDob}
                    required
                  />
                  <Input
                    label="Insurance (Optional)"
                    value={formData.insurance}
                    onChange={(e) => handleFormChange('insurance', e.target.value)}
                    placeholder="Blue Cross Blue Shield"
                  />
                </div>
              </div>


              {/* Referral Details */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Referral Details
                </h3>

                <div className="mb-12">
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Select Teeth (Optional)
                  </label>
                  <InteractiveToothChart
                    selectedTeeth={selectedTeeth}
                    onTeethChange={setSelectedTeeth}
                  />
                </div>



                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Specialist Type
                  </label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => handleFormChange('specialty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="">Select a Specialty...</option>
                    {SPECIALTIES.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Categorize the type of specialist needed for this referral.
                  </p>
                </div>

                {/* Optional: Show specific doctor selection if needed, or remove if replaced by Specialty */}
                {linkInfo?.specialists && linkInfo.specialists.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Specific Doctor (Optional)
                    </label>
                    <select
                      value={formData.intendedRecipientId}
                      onChange={(e) => handleFormChange('intendedRecipientId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option value="">Any Specialist (First Available)</option>
                      {linkInfo.specialists.map((specialist) => (
                        <option key={specialist.id} value={specialist.id}>
                          Dr. {specialist.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Referral <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.reasonForReferral}
                    onChange={(e) => handleFormChange('reasonForReferral', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.reasonForReferral ? 'border-red-300' : 'border-gray-300'
                      }`}
                    rows={4}
                    placeholder="Describe the reason for this referral..."
                    required
                  />
                  {errors.reasonForReferral && (
                    <p className="mt-1 text-sm text-red-600">{errors.reasonForReferral}</p>
                  )}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    rows={3}
                    placeholder="Any additional information..."
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Attachments (Optional)
                </h3>
                <FileUpload files={files} onFilesChange={setFiles} />
                <p className="text-xs text-gray-500 mt-2">
                  You can upload X-rays, images, or documents related to this referral
                </p>
              </div>

              {/* Submit Button */}
              <div className="border-t border-gray-200 pt-6 flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('access-code')}
                  disabled={submitting}
                >
                  Back
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Referral'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div >
  )
}

