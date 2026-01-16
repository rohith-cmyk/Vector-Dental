'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { StatsCardsV2 } from '@/components/dashboard/StatsCardsV2'
import { ReferralTrendsChart } from '@/components/dashboard/ReferralTrendsChart'
import { SpecialtyBreakdown } from '@/components/dashboard/SpecialtyBreakdown'
import { IncomingReferralsTable } from '@/components/dashboard/IncomingReferralsTable'
import { OutgoingReferralsTable } from '@/components/dashboard/OutgoingReferralsTable'
import { ReferralDetailsModal } from '@/components/referrals/ReferralDetailsModal'
import { dashboardService } from '@/services/dashboard.service'
import { referralsService } from '@/services/referrals.service'
import type { DashboardStats, Referral } from '@/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acceptingIds, setAcceptingIds] = useState<string[]>([])
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)

  useEffect(() => {
    // Initial load - show loading
    loadDashboardData(true)

    // Auto-refresh dashboard data every 2 minutes (silent refresh - no loading indicator)
    // Cache will handle showing stale data while fetching fresh
    const interval = setInterval(() => {
      loadDashboardData(false) // Silent refresh - don't show loading
    }, 120000) // 2 minutes (cache TTL)

    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async (showLoading: boolean = true, forceRefresh: boolean = false) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)
      
      // getStats() will use cache if available and fresh
      const data = await dashboardService.getStats(forceRefresh)
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

  const handleAcceptReferral = async (id: string) => {
    if (acceptingIds.includes(id)) return // Prevent duplicate request for same row

    try {
      setAcceptingIds((prev) => [...new Set([...prev, id])])
      // Optimistically remove from pending list for instant UI feedback
      setStats((prev) => {
        if (!prev) return prev
        const exists = prev.recentIncoming.some((referral) => referral.id === id)
        if (!exists) return prev
        return {
          ...prev,
          recentIncoming: prev.recentIncoming.filter((referral) => referral.id !== id),
          pendingIncoming: Math.max(0, prev.pendingIncoming - 1),
        }
      })

      // Update status to ACCEPTED (which shows as "Appointment Scheduled" in the timeline)
      // This removes it from pending list (which only shows SUBMITTED status)
      await referralsService.updateStatus(id, 'ACCEPTED')
      
      // Clear dashboard cache and refresh data
      dashboardService.clearCache()
      await loadDashboardData(false, true) // Force refresh without showing loading
    } catch (error: any) {
      console.error('Failed to accept referral:', error)
      // Revert optimistic update on failure
      loadDashboardData(false, true)
      alert(error.response?.data?.message || 'Failed to accept referral. Please try again.')
    } finally {
      setAcceptingIds((prev) => prev.filter((existingId) => existingId !== id))
    }
  }

  const handleViewReferral = async (id: string) => {
    try {
      // Fetch the referral details
      const referral = await referralsService.getById(id)
      
      // If status is SUBMITTED, update it to ACCEPTED (which removes it from pending list)
      if (referral.status === 'SUBMITTED') {
        try {
          const updatedReferral = await referralsService.updateStatus(id, 'ACCEPTED')
          setSelectedReferral(updatedReferral)
          // Refresh dashboard data
          dashboardService.clearCache()
          await loadDashboardData(false, true)
        } catch (error: any) {
          console.error('Failed to auto-update status:', error)
          // Still show the modal even if status update fails
          setSelectedReferral(referral)
        }
      } else {
        setSelectedReferral(referral)
      }
    } catch (error: any) {
      console.error('Failed to load referral:', error)
      alert(error.response?.data?.message || 'Failed to load referral. Please try again.')
    }
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
            <SpecialtyBreakdown
              data={stats.incomingReferralsBySpecialty || []}
              title="Incoming by Specialty"
            />
          </div>
        </div>

        {/* Incoming Referrals - PRIORITY (Need Your Action) */}
        <IncomingReferralsTable
          referrals={stats.recentIncoming}
          onAccept={handleAcceptReferral}
          onView={handleViewReferral}
          acceptingIds={acceptingIds}
        />

        {/* Outgoing Referrals - Track Status */}
        <OutgoingReferralsTable
          referrals={stats.recentOutgoing}
          onView={handleViewReferral}
        />
      </div>

      {/* Referral Details Modal */}
      <ReferralDetailsModal
        isOpen={!!selectedReferral}
        onClose={() => setSelectedReferral(null)}
        referral={selectedReferral}
        onStatusUpdate={() => {
          // Refresh dashboard data when status is updated from modal
          dashboardService.clearCache()
          loadDashboardData(false, true)
          // Refresh the selected referral
          if (selectedReferral) {
            referralsService.getById(selectedReferral.id).then(setSelectedReferral).catch(console.error)
          }
        }}
      />
    </DashboardLayout>
  )
}

