'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { StatsCardsV2 } from '@/components/dashboard/StatsCardsV2'
import { ReferralTrendsChart } from '@/components/dashboard/ReferralTrendsChart'
import { SpecialtyBreakdown } from '@/components/dashboard/SpecialtyBreakdown'
import { IncomingReferralsTable } from '@/components/dashboard/IncomingReferralsTable'
import { OutgoingReferralsTable } from '@/components/dashboard/OutgoingReferralsTable'
import { dashboardService } from '@/services/dashboard.service'
import type { DashboardStats } from '@/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initial load - show loading
    loadDashboardData(true)
    
    // Auto-refresh dashboard data every 60 seconds (silent refresh - no loading indicator)
    const interval = setInterval(() => {
      loadDashboardData(false) // Silent refresh - don't show loading
    }, 60000) // 60 seconds
    
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)
      const data = await dashboardService.getStats()
      setStats(data)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      // Only show error on initial load, not on auto-refresh failures
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
    alert(`Accepting referral ${id} - Feature will be implemented!`)
  }

  const handleRejectReferral = (id: string) => {
    if (confirm('Are you sure you want to reject this referral?')) {
      alert(`Rejected referral ${id}`)
    }
  }

  const handleViewReferral = (id: string) => {
    alert(`Viewing referral ${id} - Full details modal coming soon!`)
  }

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard data...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-red-500">{error}</div>
          <button
            onClick={loadDashboardData}
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
          <div className="text-gray-500">No data available</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards - Updated for Two-Way System */}
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
        />

        {/* Charts Row - Now Shows Sent vs Received */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ReferralTrendsChart data={stats.referralTrends} />
          </div>
          <div className="lg:col-span-1">
            <SpecialtyBreakdown data={stats.referralsBySpecialty} />
          </div>
        </div>

        {/* Incoming Referrals - PRIORITY (Need Your Action) */}
        <IncomingReferralsTable 
          referrals={stats.recentIncoming}
          onAccept={handleAcceptReferral}
          onReject={handleRejectReferral}
        />

        {/* Outgoing Referrals - Track Status */}
        <OutgoingReferralsTable 
          referrals={stats.recentOutgoing}
          onView={handleViewReferral}
        />
      </div>
    </DashboardLayout>
  )
}

