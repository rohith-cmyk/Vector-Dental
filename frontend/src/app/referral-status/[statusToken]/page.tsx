'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, LoadingState } from '@/components/ui'
import { StatusTimeline, type TimelineStage } from '@/components/referrals/StatusTimeline'
import { AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface ReferralStatusData {
  referralId: string
  patientName: string
  status: string
  currentStage: string
  timeline: TimelineStage[]
  submittedAt: string
  clinic: {
    id: string
    name: string
    address?: string
    phone?: string
    email?: string
  }
}

export default function ReferralStatusPage() {
  const params = useParams()
  const statusToken = params.statusToken as string

  const [statusData, setStatusData] = useState<ReferralStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const fetchStatus = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get<{ success: boolean; data: ReferralStatusData }>(
          `/public/referral-status/${statusToken}`
        )
        if (response.data.success && response.data.data) {
          setStatusData(response.data.data)
        } else {
          setError('Status not found')
        }
      } catch (error: any) {
        console.error('Failed to load referral status:', error)
        setError(error.response?.data?.message || 'Failed to load referral status')
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Referral Status</h1>
        </div>

        {/* Header Card */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Patient Name</p>
                <p className="text-lg font-semibold text-gray-900">{statusData.patientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Receiving Clinic</p>
                <p className="text-base text-gray-900">{statusData.clinic.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Submitted</p>
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
            <StatusTimeline stages={statusData.timeline} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

