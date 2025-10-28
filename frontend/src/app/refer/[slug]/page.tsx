'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, Input, Select, Button } from '@/components/ui'
import { DENTAL_SPECIALTIES } from '@/constants'
import { CheckCircle } from 'lucide-react'

export default function PublicReferralPage() {
  const params = useParams()
  const clinicSlug = params.slug as string
  
  // Mock clinic data (would fetch from API using slug)
  const targetClinic = {
    name: 'Smith Dental Clinic',
    specialty: 'Orthodontics',
    address: '123 Main Street, New York, NY',
    phone: '(555) 123-4567',
  }

  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Your clinic info
    yourClinicName: '',
    yourName: '',
    yourEmail: '',
    yourPhone: '',
    
    // Patient info
    patientName: '',
    patientDob: '',
    patientPhone: '',
    patientEmail: '',
    
    // Referral details
    reason: '',
    urgency: 'routine',
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.yourClinicName.trim()) newErrors.yourClinicName = 'Your clinic name is required'
    if (!formData.yourName.trim()) newErrors.yourName = 'Your name is required'
    if (!formData.yourEmail.trim()) newErrors.yourEmail = 'Your email is required'
    if (!formData.yourPhone.trim()) newErrors.yourPhone = 'Your phone is required'
    if (!formData.patientName.trim()) newErrors.patientName = 'Patient name is required'
    if (!formData.patientDob) newErrors.patientDob = 'Patient date of birth is required'
    if (!formData.reason.trim()) newErrors.reason = 'Reason for referral is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSubmitted(true)
    } catch (error) {
      alert('Failed to submit referral. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
              They will review and respond to your referral shortly. You will receive a confirmation email at {formData.yourEmail}.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSubmitted(false)
                setFormData({
                  yourClinicName: '',
                  yourName: '',
                  yourEmail: '',
                  yourPhone: '',
                  patientName: '',
                  patientDob: '',
                  patientPhone: '',
                  patientEmail: '',
                  reason: '',
                  urgency: 'routine',
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
            src="/logo.png" 
            alt="Logo" 
            className="h-16 w-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Refer a Patient to {targetClinic.name}
          </h1>
          <p className="text-gray-600">
            {targetClinic.specialty} • {targetClinic.address}
          </p>
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
                    value={formData.yourClinicName}
                    onChange={(e) => handleChange('yourClinicName', e.target.value)}
                    error={errors.yourClinicName}
                    placeholder="ABC Dental Clinic"
                    required
                  />
                  <Input
                    label="Your Name (Referring Dentist)"
                    value={formData.yourName}
                    onChange={(e) => handleChange('yourName', e.target.value)}
                    error={errors.yourName}
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Your Email"
                    type="email"
                    value={formData.yourEmail}
                    onChange={(e) => handleChange('yourEmail', e.target.value)}
                    error={errors.yourEmail}
                    placeholder="john@clinic.com"
                    required
                  />
                  <Input
                    label="Your Phone"
                    type="tel"
                    value={formData.yourPhone}
                    onChange={(e) => handleChange('yourPhone', e.target.value)}
                    error={errors.yourPhone}
                    placeholder="(555) 123-4567"
                    required
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
                      { value: 'routine', label: 'Routine' },
                      { value: 'urgent', label: 'Urgent' },
                      { value: 'emergency', label: 'Emergency' },
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

              {/* Submit */}
              <div className="border-t border-gray-200 pt-6">
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

