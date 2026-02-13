'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { StatsCardsV2 } from '@/components/dashboard/StatsCardsV2'
import { ReferralTrendsChart } from '@/components/dashboard/ReferralTrendsChart'
import { BreakdownChart } from '@/components/dashboard/SpecialtyBreakdown'
import { ReferralProcessFlowChart } from '@/components/dashboard/ReferralProcessFlowChart'
import { OverviewMetrics } from '@/components/dashboard/OverviewMetrics'
import { IncomingReferralsTable } from '@/components/dashboard/IncomingReferralsTable'
import { ReferralDetailsModal } from '@/components/referrals/ReferralDetailsModal'
import { RefreshCw } from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import { referralsService } from '@/services/referrals.service'
import type { DashboardStats, Referral } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [processFlowRange, setProcessFlowRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    loadDashboardData(true)

    const interval = setInterval(() => {
      loadDashboardData(false)
    }, 120000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadDashboardData(true, true)
    } finally {
      setIsRefreshing(false)
    }
  }

  const loadDashboardData = async (
    showLoading: boolean = true,
    forceRefresh: boolean = false,
    periodOverride?: 'weekly' | 'monthly' | 'yearly'
  ) => {
    const period = periodOverride ?? processFlowRange
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      const data = await dashboardService.getStats(
        { trendsPeriod: period, specialtyPeriod: period },
        forceRefresh
      )
      setStats(data)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      if (showLoading) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      }
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const handleAcceptReferral = (id: string) => {
    router.push(`/referrals?referralId=${id}&action=accept`)
  }

  const handleViewReferral = (id: string) => {
    router.push(`/referrals?referralId=${id}`)
  }

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-neutral-500">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-sm text-neutral-500">{error}</div>
          <button
            onClick={() => loadDashboardData()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    )
  }

  if (!stats) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-neutral-500">No data available</div>
        </div>
      </DashboardLayout>
    )
  }

  const referralTrendsData = stats.referralTrends || []

  const baseProcessFlow = stats.referralProcessFlow || []
  const processFlowData = baseProcessFlow.map((step, index) => {
    if (index === 0) {
      return {
        ...step,
        label: 'Referrals\nReceived',
        footerLabel: 'Received',
      }
    }
    return step
  })

  const officeBreakdown = (stats.referralsByOffice || []).map(item => ({
    category: item.office,
    count: item.count,
    percentage: item.percentage,
  }))

  const overviewMetrics = stats.overviewMetrics || {
    dailyAverage: 0,
    avgSchedule: '-',
    avgAppointment: '-',
    avgTimeToTreatment: '-',
  }

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Monitor your activity and performance"
      actions={
        <>
          <button
            onClick={() => handleRefresh()}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-sm text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            Refresh
          </button>
        </>
      }
    >
      <div className="space-y-8">
        <StatsCardsV2
          stats={{
            totalOutgoing: stats.totalOutgoing,
            totalIncoming: stats.totalIncoming,
            pendingIncoming: stats.pendingIncoming,
            completedThisMonth: stats.completedThisMonth,
            outgoingChange: stats.outgoingChange,
            incomingChange: stats.incomingChange,
            completedChange: stats.completedChange,
          }}
          showOutgoing={false}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <OverviewMetrics
              dailyAverage={overviewMetrics.dailyAverage}
              avgSchedule={overviewMetrics.avgSchedule}
              avgAppointment={overviewMetrics.avgAppointment}
              avgTimeToTreatment={overviewMetrics.avgTimeToTreatment}
            />
          </div>
          <div className="lg:col-span-2">
            <ReferralProcessFlowChart
              data={processFlowData}
              period={processFlowRange}
              onPeriodChange={(p) => {
                setProcessFlowRange(p)
                loadDashboardData(false, true, p)
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ReferralTrendsChart data={referralTrendsData} showOutgoing={false} />
              </div>
              <div className="lg:col-span-1">
                <BreakdownChart data={officeBreakdown} title="By Office" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="mb-6">
              <IncomingReferralsTable
                referrals={stats.recentIncoming}
                onAccept={handleAcceptReferral}
                onView={handleViewReferral}
              />
            </div>
          </div>
        </div>
      </div>

      <ReferralDetailsModal
        isOpen={!!selectedReferral}
        onClose={() => setSelectedReferral(null)}
        referral={selectedReferral}
        onStatusUpdate={() => {
          dashboardService.clearCache()
          loadDashboardData(false, true)
          if (selectedReferral) {
            referralsService.getById(selectedReferral.id).then(setSelectedReferral).catch(console.error)
          }
        }}
      />
    </DashboardLayout>
  )
}
