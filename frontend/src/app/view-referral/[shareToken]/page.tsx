'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, LoadingState } from '@/components/ui'
import { FileText, Download, Phone, Mail, Calendar, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { api, API_URL } from '@/lib/api'

interface SharedReferralData {
  id: string
  patientName: string
  patientFirstName?: string
  patientLastName?: string
  patientDob: string
  patientPhone?: string
  patientEmail?: string
  insurance?: string
  fromClinicName?: string
  referringDentist?: string
  fromClinicEmail?: string
  fromClinicPhone?: string
  reason: string
  notes?: string
  urgency: string
  status: string
  selectedTeeth?: string[]
  createdAt: string
  clinic: {
    id: string
    name: string
    address?: string
    phone?: string
    email?: string
  }
  files: Array<{
    id: string
    fileName: string
    fileUrl: string
    fileSize: number
    fileType?: string
    mimeType?: string
    createdAt: string
  }>
}

export default function ViewReferralPage() {
  const params = useParams()
  const shareToken = params.shareToken as string

  const [referral, setReferral] = useState<SharedReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const fetchReferral = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get<{ success: boolean; data: SharedReferralData }>(
          `/public/referral/${shareToken}`
        )
        if (response.data.success && response.data.data) {
          setReferral(response.data.data)
        } else {
          setError('Referral not found')
        }
      } catch (error: any) {
        console.error('Failed to load shared referral:', error)
        setError(error.response?.data?.message || 'Failed to load referral')
      } finally {
        setLoading(false)
      }
    }

    if (shareToken) {
      fetchReferral()
    }
  }, [shareToken])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success'
      case 'SENT': return 'info'
      case 'ACCEPTED': return 'warning'
      case 'CANCELLED': return 'danger'
      case 'SUBMITTED': return 'info'
      default: return 'default'
    }
  }

  const getUrgencyVariant = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY': return 'danger'
      case 'URGENT': return 'warning'
      default: return 'default'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gray-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8 text-center">
            <LoadingState
              title="Loading referral..."
              subtitle="Fetching the referral details"
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !referral) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gray-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Referral Not Found</h1>
            <p className="text-gray-600 mb-4">
              {error || 'The referral link you are trying to access is invalid or has expired.'}
            </p>
            <p className="text-sm text-gray-500">
              Please contact the clinic directly if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const patientName = referral.patientFirstName && referral.patientLastName
    ? `${referral.patientFirstName} ${referral.patientLastName}`
    : referral.patientName

  const clinicName = referral.fromClinicName || 'Unknown Clinic'
  const doctorName = referral.referringDentist

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Details</h1>
          <p className="text-gray-600">Shared by {referral.clinic.name}</p>
        </div>

        {/* Patient Information Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{patientName}</CardTitle>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span suppressHydrationWarning>
                      DOB: {formatDate(new Date(referral.patientDob))}
                    </span>
                  </div>
                  {referral.patientPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{referral.patientPhone}</span>
                    </div>
                  )}
                  {referral.patientEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{referral.patientEmail}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={getUrgencyVariant(referral.urgency)}>
                  {referral.urgency || 'ROUTINE'}
                </Badge>
                <Badge variant={getStatusVariant(referral.status)}>
                  {referral.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {referral.insurance && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Insurance</p>
                <p className="text-base text-gray-900">{referral.insurance}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referrer Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>From</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Clinic Name</p>
                <p className="text-base text-gray-900">{clinicName}</p>
              </div>
              {doctorName && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Doctor</p>
                  <p className="text-base text-gray-900">
                    {doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}
                  </p>
                </div>
              )}
              {referral.fromClinicEmail && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${referral.fromClinicEmail}`} className="text-base text-blue-600 hover:text-blue-800">
                      {referral.fromClinicEmail}
                    </a>
                  </div>
                </div>
              )}
              {referral.fromClinicPhone && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${referral.fromClinicPhone}`} className="text-base text-blue-600 hover:text-blue-800">
                      {referral.fromClinicPhone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Referral Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Reason for Referral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap">{referral.reason}</p>
            </div>
          </CardContent>
        </Card>

        {/* Notes Card */}
        {referral.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap text-sm">{referral.notes}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attached Files Card */}
        <Card>
          <CardHeader>
            <CardTitle>Attached Files ({referral.files?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {referral.files && referral.files.length > 0 ? (
              <div className="space-y-3">
                {referral.files.map((file) => {
                  // Handle local development URLs
                  const fileUrl = file.fileUrl.startsWith('/')
                    ? `${API_URL.replace('/api', '')}${file.fileUrl}`
                    : file.fileUrl

                  return (
                    <a
                      key={file.id}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 p-3 bg-gray-100 rounded-lg">
                          <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.fileName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(file.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <Button variant="outline" size="sm" className="group-hover:bg-gray-100">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </a>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No files attached</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receiving Clinic Information */}
        {referral.clinic && (
          <Card>
            <CardHeader>
              <CardTitle>Receiving Clinic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Clinic Name</p>
                  <p className="text-base text-gray-900">{referral.clinic.name}</p>
                </div>
                {referral.clinic.address && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                    <p className="text-base text-gray-900">{referral.clinic.address}</p>
                  </div>
                )}
                {referral.clinic.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${referral.clinic.phone}`} className="text-base text-blue-600 hover:text-blue-800">
                        {referral.clinic.phone}
                      </a>
                    </div>
                  </div>
                )}
                {referral.clinic.email && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${referral.clinic.email}`} className="text-base text-blue-600 hover:text-blue-800">
                        {referral.clinic.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

