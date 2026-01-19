'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, LoadingState, Modal, Button } from '@/components/ui'
import { StatusTimeline, type TimelineStage } from '@/components/referrals/StatusTimeline'
import { AlertCircle } from 'lucide-react'
import { api, API_URL } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface ReferralStatusData {
  referralId: string
  patientName: string
  patientDob?: string | null
  reason?: string | null
  status: string
  currentStage: string
  timeline: TimelineStage[]
  submittedAt: string
  acceptedAt?: string | null
  scheduledAt?: string | null
  completedAt?: string | null
  postOpScheduledAt?: string | null
  opsReportComment?: string | null
  opsReportUrl?: string | null
  opsReportFiles?: Array<{
    id: string
    fileName: string
    fileUrl: string
    fileSize?: number
  }>
  clinic: {
    id: string
    name: string
    address?: string
    phone?: string
    email?: string
    logoUrl?: string
  }
}

export default function ReferralStatusPage() {
  const params = useParams()
  const statusToken = params.statusToken as string

  const [statusData, setStatusData] = useState<ReferralStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessCode, setAccessCode] = useState('')
  const [requiresAccessCode, setRequiresAccessCode] = useState(false)
  const [isOpsModalOpen, setIsOpsModalOpen] = useState(false)

  const hasOpsReport = !!statusData?.opsReportComment
    || (statusData?.opsReportFiles && statusData.opsReportFiles.length > 0)

  const formatDateTime = (value?: string | null) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }) + `, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }

  const applyTimelineDates = (data: ReferralStatusData) => {
    if (data.timeline.some((stage) => stage.dateLabel)) {
      return data.timeline
    }
    const acceptedLabel = formatDateTime(data.acceptedAt)
    const scheduledLabel = formatDateTime(data.scheduledAt)
    const completedLabel = formatDateTime(data.completedAt)
    const postOpLabel = formatDateTime(data.postOpScheduledAt)

    return data.timeline.map((stage) => {
      if (stage.key === 'referral_accepted') {
        return { ...stage, dateLabel: acceptedLabel || undefined }
      }
      if (stage.key === 'appointment_scheduled') {
        return { ...stage, dateLabel: scheduledLabel || undefined }
      }
      if (stage.key === 'appointment_completed') {
        return { ...stage, dateLabel: completedLabel || undefined }
      }
      if (stage.key === 'post_op_treatment_scheduled') {
        return { ...stage, dateLabel: postOpLabel || undefined }
      }
      return stage
    })
  }

  const resolveFileUrl = (fileUrl: string) => {
    if (!fileUrl) return ''
    if (fileUrl.startsWith('/')) {
      return `${API_URL.replace('/api', '')}${fileUrl}`
    }
    return fileUrl
  }

  const resolveLogoUrl = (url?: string) => {
    if (!url) return ''
    if (url.startsWith('/')) {
      return `${API_URL.replace('/api', '')}${url}`
    }
    return url
  }

  const handlePrintOpsReport = () => {
    if (!statusData) return
    const files = statusData.opsReportFiles || []
    const fileList = files
      .map((file) => `<li>${file.fileName}</li>`)
      .join('')
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head>
          <title>Ops Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
            h1 { font-size: 22px; margin-bottom: 8px; }
            h2 { font-size: 16px; margin-top: 20px; }
            .label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
            .section { margin-top: 16px; }
            ul { padding-left: 18px; }
          </style>
        </head>
        <body>
          <h1>Ops Report</h1>
          <div class="section">
            <div class="label">Clinic</div>
            <div>${statusData.clinic.name}</div>
          </div>
          <div class="section">
            <div class="label">Patient</div>
            <div>${statusData.patientName}</div>
          </div>
          <div class="section">
            <div class="label">Referral Submitted On</div>
            <div>${formatDate(new Date(statusData.submittedAt))}</div>
          </div>
          <div class="section">
            <div class="label">Doctor Comments</div>
            <div>${statusData.opsReportComment || 'No comments added yet.'}</div>
          </div>
          <div class="section">
            <div class="label">X-Rays / Attachments</div>
            <ul>${fileList || '<li>No documents attached.</li>'}</ul>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const fetchStatus = async (code?: string) => {
      try {
        setLoading(true)
        setError(null)
        setRequiresAccessCode(false)
        const response = await api.get<{ success: boolean; data: ReferralStatusData }>(
          `/public/referral-status/${statusToken}`,
          code ? { params: { accessCode: code } } : undefined
        )
        if (response.data.success && response.data.data) {
          setStatusData({
            ...response.data.data,
            timeline: applyTimelineDates(response.data.data),
          })
        } else {
          setError('Status not found')
        }
      } catch (error: any) {
        console.error('Failed to load referral status:', error)
        const message = error.response?.data?.message || 'Failed to load referral status'
        setError(message)
        if (message.toLowerCase().includes('access code')) {
          setRequiresAccessCode(true)
        }
      } finally {
        setLoading(false)
      }
    }

    if (statusToken) {
      fetchStatus()
    }
  }, [statusToken])

  if (loading) {
    return (
      <LoadingState
        className="min-h-screen bg-gray-50"
        title="Loading referral status..."
        subtitle="Fetching the latest timeline"
      />
    )
  }

  if ((error || !statusData) && requiresAccessCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mb-2">
              <AlertCircle className="h-10 w-10 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Access Code Required</h1>
            <p className="text-gray-600">
              Enter the access code from your email to view the referral status.
            </p>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Access code"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => {
                if (!accessCode.trim()) return
                setStatusData(null)
                setError(null)
                setLoading(true)
                api
                  .get<{ success: boolean; data: ReferralStatusData }>(
                    `/public/referral-status/${statusToken}`,
                    { params: { accessCode: accessCode.trim() } }
                  )
                  .then((response) => {
                    if (response.data.success && response.data.data) {
                      setStatusData({
                        ...response.data.data,
                        timeline: applyTimelineDates(response.data.data),
                      })
                    } else {
                      setError('Status not found')
                    }
                  })
                  .catch((error: any) => {
                    const message = error.response?.data?.message || 'Failed to load referral status'
                    setError(message)
                  })
                  .finally(() => {
                    setLoading(false)
                  })
              }}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Continue
            </button>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !statusData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Status Not Found</h1>
            <p className="text-gray-600 mb-4">
              {error || 'Invalid or expired token'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3">
          {statusData.clinic.logoUrl && (
            <div className="h-16 w-16 rounded-full border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
              <img
                src={resolveLogoUrl(statusData.clinic.logoUrl)}
                alt={`${statusData.clinic.name} logo`}
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{statusData.clinic.name}</h1>
            <p className="text-base font-semibold text-gray-700 mt-1">Patient Referral Status</p>
          </div>
        </div>

        {/* Patient Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Patient Name</p>
                <p className="text-base font-semibold text-gray-900">{statusData.patientName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Date of Birth</p>
                <p className="text-base text-gray-900">
                  {statusData.patientDob ? formatDate(new Date(statusData.patientDob)) : '—'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-medium text-gray-500 mb-1">Reason for Treatment</p>
                <p className="text-base text-gray-900">{statusData.reason || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Referral Submitted On</p>
                <p className="text-base text-gray-900">
                  {formatDate(new Date(statusData.submittedAt))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline Card */}
        <Card>
          <CardHeader>
            <CardTitle>Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline
              stages={statusData.timeline}
              renderAfterStage={(stage) => {
                if (stage.key !== 'appointment_completed') return null
                return (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        if (hasOpsReport) {
                          setIsOpsModalOpen(true)
                        } else {
                          document.getElementById('ops-report')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                      }}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      View Ops Report
                    </button>
                  </div>
                )
              }}
            />
          </CardContent>
        </Card>

        <Card id="ops-report">
          <CardHeader>
            <CardTitle>Post Op Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Comments and attachments</div>
              {(statusData.opsReportComment || (statusData.opsReportFiles && statusData.opsReportFiles.length > 0)) && (
                <button
                  onClick={() => setIsOpsModalOpen(true)}
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  View Ops Report
                </button>
              )}
            </div>
            <div className="text-sm text-gray-800">
              {statusData.opsReportComment || 'No comments added yet.'}
            </div>
            {statusData.opsReportFiles && statusData.opsReportFiles.length > 0 ? (
              <div className="space-y-2">
                {statusData.opsReportFiles.map((file) => (
                  <a
                    key={file.id}
                    href={resolveFileUrl(file.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <span className="truncate">{file.fileName}</span>
                    <span className="text-xs text-gray-400">Download</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No documents attached.</div>
            )}
          </CardContent>
        </Card>
      <Modal
        isOpen={isOpsModalOpen}
        onClose={() => setIsOpsModalOpen(false)}
        title="Ops Report"
        size="lg"
      >
        {statusData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-gray-500 mb-1">Patient Name</div>
                <div className="text-sm text-gray-900">{statusData.patientName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Clinic</div>
                <div className="text-sm text-gray-900">{statusData.clinic.name}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Doctor Comments</div>
              <div className="text-sm text-gray-900">
                {statusData.opsReportComment || 'No comments added yet.'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2">X-Rays / Attachments</div>
              {statusData.opsReportFiles && statusData.opsReportFiles.length > 0 ? (
                <div className="space-y-2">
                  {statusData.opsReportFiles.map((file) => (
                    <a
                      key={file.id}
                      href={resolveFileUrl(file.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span className="truncate">{file.fileName}</span>
                      <span className="text-xs text-gray-400">Download</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No documents attached.</div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpsModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={handlePrintOpsReport}>
                Print
              </Button>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </div>
  )
}

