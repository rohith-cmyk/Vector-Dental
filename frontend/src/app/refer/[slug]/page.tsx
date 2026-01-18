'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, Input, Select, Button, LoadingState } from '@/components/ui'
import { FileUpload } from '@/components/referrals/FileUpload'
import { api, API_URL } from '@/lib/api'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface ClinicInfo {
  name: string
  address?: string
  phone?: string
  email?: string
  logoUrl?: string
  slug: string
}

export default function PublicReferralPage() {
  const params = useParams()
  const clinicSlug = params.slug as string
  
  const [targetClinic, setTargetClinic] = useState<ClinicInfo | null>(null)
  const [loadingClinic, setLoadingClinic] = useState(true)
  const [clinicError, setClinicError] = useState<string | null>(null)

  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    // Your clinic info
    fromClinicName: '',
    referringDentist: '',
    fromClinicEmail: '',
    fromClinicPhone: '',
    
    // Patient info
    patientName: '',
    patientDob: '',
    patientPhone: '',
    patientEmail: '',
    
    // Referral details
    reason: '',
    urgency: 'ROUTINE',
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const resolveLogoUrl = (url?: string) => {
    if (!url) return ''
    if (url.startsWith('/')) {
      return `${API_URL.replace('/api', '')}${url}`
    }
    return url
  }

  // Fetch clinic info by slug (only on client side)
  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') return
    
    const fetchClinic = async () => {
      try {
        setLoadingClinic(true)
        setClinicError(null)
        const response = await api.get<{ success: boolean; data: ClinicInfo }>(`/public/clinic/${clinicSlug}`)
        if (response.data.success && response.data.data) {
          setTargetClinic(response.data.data)
        } else {
          setClinicError('Clinic not found')
        }
      } catch (error: any) {
        console.error('Failed to load clinic:', error)
        setClinicError(error.response?.data?.message || 'Failed to load clinic information')
      } finally {
        setLoadingClinic(false)
      }
    }

    if (clinicSlug) {
      fetchClinic()
    }
  }, [clinicSlug])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.fromClinicName.trim()) newErrors.fromClinicName = 'Your clinic name is required'
    if (!formData.referringDentist.trim()) newErrors.referringDentist = 'Your name is required'
    if (!formData.fromClinicEmail.trim()) newErrors.fromClinicEmail = 'Your email is required'
    if (!formData.patientName.trim()) newErrors.patientName = 'Patient name is required'
    if (!formData.patientDob) newErrors.patientDob = 'Patient date of birth is required'
    if (!formData.reason.trim()) newErrors.reason = 'Reason for referral is required'
    
    // Email validation
    if (formData.fromClinicEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.fromClinicEmail)) {
      newErrors.fromClinicEmail = 'Please enter a valid email address'
    }
    
    if (formData.patientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patientEmail)) {
      newErrors.patientEmail = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    if (!targetClinic) {
      setClinicError('Clinic information not loaded')
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      // Prepare form data
      const referralData = {
        fromClinicName: formData.fromClinicName,
        fromClinicEmail: formData.fromClinicEmail,
        fromClinicPhone: formData.fromClinicPhone || undefined,
        referringDentist: formData.referringDentist,
        patientName: formData.patientName,
        patientDob: formData.patientDob,
        patientPhone: formData.patientPhone || undefined,
        patientEmail: formData.patientEmail || undefined,
        reason: formData.reason,
        urgency: formData.urgency.toUpperCase(),
        notes: formData.notes || undefined,
      }

      // Submit referral via API
      const response = await api.post(`/public/referral/${clinicSlug}`, referralData)
      
      // TODO: Upload files if any (will need separate file upload endpoint)
      // For now, files are collected but not uploaded
      // if (files.length > 0) {
      //   // Upload files after referral is created
      // }
      
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
  if (loadingClinic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gray-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <LoadingState
              title="Loading referral form..."
              subtitle="Preparing the clinic details"
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (clinicError || !targetClinic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gray-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Clinic Not Found</h1>
            <p className="text-gray-600 mb-4">
              {clinicError || 'The referral link you are trying to access is invalid or inactive.'}
            </p>
            <p className="text-sm text-gray-500">
              Please contact the clinic directly or check the link and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gray-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Referral Submitted!</h1>
            <p className="text-gray-600 mb-4">
              Your referral has been successfully sent to {targetClinic.name}.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              They will review and respond to your referral shortly. You will receive a confirmation email at {formData.fromClinicEmail}.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSubmitted(false)
                setFiles([])
                setFormData({
                  fromClinicName: '',
                  referringDentist: '',
                  fromClinicEmail: '',
                  fromClinicPhone: '',
                  patientName: '',
                  patientDob: '',
                  patientPhone: '',
                  patientEmail: '',
                  reason: '',
                  urgency: 'ROUTINE',
                  notes: '',
                })
              }}
            >
              Submit Another Referral
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={resolveLogoUrl(targetClinic.logoUrl) || '/logo.png'}
            alt={`${targetClinic.name} logo`}
            className="h-16 w-16 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Refer a Patient to {targetClinic.name}
          </h1>
          {targetClinic.address && (
            <p className="text-gray-600">
              {targetClinic.address}
              {targetClinic.phone && ` • ${targetClinic.phone}`}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Fill out this form to refer a patient. No account required.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Your Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Your Clinic Name"
                    value={formData.fromClinicName}
                    onChange={(e) => handleChange('fromClinicName', e.target.value)}
                    error={errors.fromClinicName}
                    placeholder="ABC Dental Clinic"
                    required
                  />
                  <Input
                    label="Your Name (Referring Dentist)"
                    value={formData.referringDentist}
                    onChange={(e) => handleChange('referringDentist', e.target.value)}
                    error={errors.referringDentist}
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Your Email"
                    type="email"
                    value={formData.fromClinicEmail}
                    onChange={(e) => handleChange('fromClinicEmail', e.target.value)}
                    error={errors.fromClinicEmail}
                    placeholder="john@clinic.com"
                    required
                  />
                  <Input
                    label="Your Phone (Optional)"
                    type="tel"
                    value={formData.fromClinicPhone}
                    onChange={(e) => handleChange('fromClinicPhone', e.target.value)}
                    error={errors.fromClinicPhone}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Patient Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Patient Name"
                    value={formData.patientName}
                    onChange={(e) => handleChange('patientName', e.target.value)}
                    error={errors.patientName}
                    placeholder="John Doe"
                    required
                  />
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={formData.patientDob}
                    onChange={(e) => handleChange('patientDob', e.target.value)}
                    error={errors.patientDob}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Patient Phone (Optional)"
                    type="tel"
                    value={formData.patientPhone}
                    onChange={(e) => handleChange('patientPhone', e.target.value)}
                    placeholder="(555) 987-6543"
                  />
                  <Input
                    label="Patient Email (Optional)"
                    type="email"
                    value={formData.patientEmail}
                    onChange={(e) => handleChange('patientEmail', e.target.value)}
                    placeholder="patient@email.com"
                  />
                </div>
              </div>

              {/* Referral Details */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Details</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Referral <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                    rows={3}
                    required
                    placeholder="Please describe the reason for this referral..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                  />
                  {errors.reason && (
                    <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                  )}
                </div>

                <div className="mt-4">
                  <Select
                    label="Urgency Level"
                    value={formData.urgency}
                    onChange={(e) => handleChange('urgency', e.target.value)}
                    options={[
                      { value: 'ROUTINE', label: 'Routine' },
                      { value: 'URGENT', label: 'Urgent' },
                      { value: 'EMERGENCY', label: 'Emergency' },
                    ]}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Any additional information..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.notes?.length || 0}/500 characters
                  </p>
                </div>
              </div>

              {/* File Upload */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Documents (Optional)</h3>
                <FileUpload files={files} onFilesChange={setFiles} />
                <p className="text-xs text-gray-500 mt-2">
                  Upload X-rays, photos, or other relevant patient documents. Max 10MB per file.
                </p>
              </div>

              {/* Submit */}
              <div className="border-t border-gray-200 pt-6">
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    📧 You will receive an email confirmation once {targetClinic.name} reviews your referral.
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isSubmitting}
                >
                  Submit Referral to {targetClinic.name}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          This is a secure referral submission form. Your information will only be shared with {targetClinic.name}.
        </p>
      </div>
    </div>
  )
}

