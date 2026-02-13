'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, LoadingState } from '@/components/ui'
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
import { USE_MOCK_DATA } from '@/constants'
import type { DashboardStats, Referral } from '@/types'

// Mock data for development
const mockDashboardStats: DashboardStats = {
  totalReferrals: 70,
  totalOutgoing: 47,
  totalIncoming: 23,
  pendingIncoming: 3,
  pendingOutgoing: 5,
  completedThisMonth: 12,
  outgoingChange: 12.5,
  incomingChange: -5.2,
  completedChange: 8.7,
  recentIncoming: [
    {
      id: '1',
      referralType: 'INCOMING',
      fromClinicId: 'external1',
      fromClinicName: 'Sunset Dental Clinic',
      fromClinicEmail: 'contact@sunsetdental.com',
      fromClinicPhone: '(555) 111-2222',
      referringDentist: 'Dr. Robert Smith',
      patientName: 'John Doe',
      patientDob: '1985-03-15',
      patientPhone: '(555) 555-0101',
      patientEmail: 'john.doe@email.com',
      reason: 'Patient requires orthodontic consultation for severe crowding and bite issues',
      urgency: 'ROUTINE',
      status: 'SENT',
      notes: 'Patient has mild anxiety, prefers morning appointments',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      referralType: 'INCOMING',
      fromClinicId: 'external2',
      fromClinicName: 'Riverside Family Dentistry',
      fromClinicEmail: 'info@riversidedental.com',
      fromClinicPhone: '(555) 222-3333',
      referringDentist: 'Dr. Lisa Wong',
      patientName: 'Jane Smith',
      patientDob: '1992-07-22',
      patientPhone: '(555) 555-0102',
      patientEmail: 'jane.smith@email.com',
      reason: 'Wisdom tooth extraction - impacted lower left wisdom tooth causing pain',
      urgency: 'URGENT',
      status: 'SENT',
      notes: 'Patient allergic to penicillin, prefers sedation',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      referralType: 'INCOMING',
      fromClinicId: 'external3',
      fromClinicName: 'Mountain View Dental',
      fromClinicEmail: 'appointments@mountainviewdental.com',
      fromClinicPhone: '(555) 333-4444',
      referringDentist: 'Dr. David Brown',
      patientName: 'Michael Johnson',
      patientDob: '1978-12-05',
      patientPhone: '(555) 555-0103',
      patientEmail: 'michael.johnson@email.com',
      reason: 'Periodontal treatment needed - advanced gum disease with bone loss',
      urgency: 'ROUTINE',
      status: 'SENT',
      notes: 'Patient is a smoker, committed to quitting',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  recentOutgoing: [
    {
      id: '6',
      referralType: 'OUTGOING',
      fromClinicId: 'clinic1',
      toContactId: '1',
      contact: {
        id: '1',
        clinicId: 'clinic1',
        name: 'Dr. Sarah Johnson',
        specialty: 'Orthodontics',
        phone: '(555) 123-4567',
        email: 'sarah.johnson@ortho.com',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      patientName: 'Emma Thompson',
      patientDob: '1995-11-12',
      patientPhone: '(555) 555-0201',
      patientEmail: 'emma.thompson@email.com',
      reason: 'Orthodontic evaluation for braces - Class II malocclusion',
      urgency: 'ROUTINE',
      status: 'SENT',
      notes: 'Teenage patient, very motivated for treatment',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '7',
      referralType: 'OUTGOING',
      fromClinicId: 'clinic1',
      toContactId: '2',
      contact: {
        id: '2',
        clinicId: 'clinic1',
        name: 'Dr. Michael Chen',
        specialty: 'Oral Surgery',
        phone: '(555) 234-5678',
        email: 'michael.chen@oralsurg.com',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      patientName: 'William Rodriguez',
      patientDob: '1982-04-28',
      patientPhone: '(555) 555-0202',
      patientEmail: 'william.rodriguez@email.com',
      reason: 'Surgical extraction of impacted wisdom teeth - all four',
      urgency: 'URGENT',
      status: 'ACCEPTED',
      notes: 'Patient has anxiety, may need conscious sedation',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '8',
      referralType: 'OUTGOING',
      fromClinicId: 'clinic1',
      toContactId: '3',
      contact: {
        id: '3',
        clinicId: 'clinic1',
        name: 'Dr. Emily Davis',
        specialty: 'Periodontics',
        phone: '(555) 345-6789',
        email: 'emily.davis@perio.com',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      patientName: 'Olivia Martinez',
      patientDob: '1975-01-15',
      patientPhone: '(555) 555-0203',
      patientEmail: 'olivia.martinez@email.com',
      reason: 'Periodontal therapy - generalized moderate periodontitis',
      urgency: 'ROUTINE',
      status: 'COMPLETED',
      notes: 'Patient compliant with home care, good prognosis',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  referralTrends: [
    { month: 'Jan 1', outgoing: 5, incoming: 2 },
    { month: 'Jan 8', outgoing: 8, incoming: 3 },
    { month: 'Jan 15', outgoing: 6, incoming: 4 },
    { month: 'Jan 22', outgoing: 9, incoming: 2 },
    { month: 'Jan 29', outgoing: 7, incoming: 5 },
    { month: 'Feb 5', outgoing: 11, incoming: 3 },
    { month: 'Feb 12', outgoing: 8, incoming: 4 },
  ],
  referralsBySpecialty: [
    { specialty: 'Orthodontics', count: 8, percentage: 40 },
    { specialty: 'Oral Surgery', count: 6, percentage: 30 },
    { specialty: 'Periodontics', count: 4, percentage: 20 },
    { specialty: 'Endodontics', count: 3, percentage: 15 },
    { specialty: 'General Dentistry', count: 2, percentage: 10 },
  ],
  referralsByOffice: [
    { office: 'Lakeside Dental Arts', count: 16, percentage: 16 },
    { office: 'Summit Family Dentistry', count: 12, percentage: 12 },
    { office: 'The Modern Dental Studio', count: 10, percentage: 10 },
    { office: 'Cornerstone Dental Health', count: 9, percentage: 9 },
    { office: 'Sunset Dental Clinic', count: 15, percentage: 15 },
    { office: 'Riverside Family Dentistry', count: 12, percentage: 12 },
    { office: 'Mountain View Dental', count: 8, percentage: 8 },
    { office: 'Downtown Dental Center', count: 10, percentage: 10 },
    { office: 'Northside Dental Practice', count: 8, percentage: 8 },
  ],
  referralProcessFlow: [
    { label: 'Referrals\nReceived', footerLabel: 'Received', count: 47, percentage: 100 },
    { label: 'Scheduled', count: 32, percentage: 68 },
    { label: 'Completed', count: 12, percentage: 26 },
  ],
  overviewMetrics: {
    dailyAverage: 3.5,
    avgSchedule: '3.1 hrs',
    avgAppointment: '~4 days',
    avgTimeToTreatment: '~8 days',
  },
}

const demoOverviewMetrics = {
  dailyAverage: 3.5,
  avgSchedule: '3.1 hrs',
  avgAppointment: '~4 days',
  avgTimeToTreatment: '~8 days',
}

const demoOfficeAdditions = [
  { office: 'Lakeside Dental Arts', count: 12 },
  { office: 'Summit Family Dentistry', count: 10 },
  { office: 'The Modern Dental Studio', count: 9 },
  { office: 'Cornerstone Dental Health', count: 8 },
]

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [processFlowRange, setProcessFlowRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')

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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadDashboardData(true, true) // Force refresh
    } finally {
      setIsRefreshing(false)
    }
  }

  const loadDashboardData = async (showLoading: boolean = true, forceRefresh: boolean = false) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      if (USE_MOCK_DATA) {
        // Use mock data for development
        let data = mockDashboardStats

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        setStats(data)
        console.log('Using mock dashboard data:', data)
      } else {
        // getStats() will use cache if available and fresh
        const data = await dashboardService.getStats(forceRefresh)
        setStats(data)
      }
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
    router.push(`/referrals?referralId=${id}&action=accept`)
  }

  const handleViewReferral = (id: string) => {
    router.push(`/referrals?referralId=${id}`)
  }

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <LoadingState title="Loading dashboard..." />
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

  const fallbackReferralTrends = [
    { month: 'Feb', outgoing: 6, incoming: 3 },
    { month: 'Mar', outgoing: 8, incoming: 4 },
    { month: 'Apr', outgoing: 5, incoming: 2 },
    { month: 'May', outgoing: 9, incoming: 5 },
    { month: 'Jun', outgoing: 7, incoming: 4 },
    { month: 'Jul', outgoing: 10, incoming: 6 },
    { month: 'Aug', outgoing: 8, incoming: 5 },
    { month: 'Sep', outgoing: 12, incoming: 7 },
    { month: 'Oct', outgoing: 9, incoming: 6 },
    { month: 'Nov', outgoing: 11, incoming: 8 },
    { month: 'Dec', outgoing: 13, incoming: 9 },
    { month: 'Jan', outgoing: 15, incoming: 11 },
  ]
  const referralTrendsData = fallbackReferralTrends

  const baseProcessFlow = stats.referralProcessFlow || []
  const baseProcessCount = baseProcessFlow[0]?.count || 0
  const processFlowData = baseProcessFlow.map((step, index) => {
    if (index === 0) {
      return {
        ...step,
        label: 'Referrals\nReceived',
        footerLabel: 'Received',
      }
    }
    if (index === 1) {
      return {
        ...step,
        count: 15,
        percentage: baseProcessCount > 0 ? Math.round((15 / baseProcessCount) * 100) : step.percentage
      }
    }
    return step
  })

  const officeBreakdown = applyDemoOfficeAdditions(
    (stats.referralsByOffice || []).map(item => ({
      category: item.office,
      count: item.count,
      percentage: item.percentage
    })),
    demoOfficeAdditions
  )

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
          showOutgoing={false}
        />

        {/* Overview Metrics & Process Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <OverviewMetrics
              dailyAverage={demoOverviewMetrics.dailyAverage}
              avgSchedule={demoOverviewMetrics.avgSchedule}
              avgAppointment={demoOverviewMetrics.avgAppointment}
              avgTimeToTreatment={demoOverviewMetrics.avgTimeToTreatment}
            />
          </div>
          <div className="lg:col-span-2">
            <ReferralProcessFlowChart
              data={processFlowData}
              period={processFlowRange}
              onPeriodChange={setProcessFlowRange}
            />
          </div>
        </div>

        {/* Analytics Section */}
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

        {/* Referrals Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>

            {/* Incoming Referrals - PRIORITY (Need Your Action) */}
            <div className="mb-6">
              <IncomingReferralsTable
                referrals={stats.recentIncoming}
                onAccept={handleAcceptReferral}
                onView={handleViewReferral}
              />
            </div>

            {/* Outgoing Referrals removed */}
          </div>
        </div>
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

function applyDemoOfficeAdditions(
  existing: Array<{ category: string; count: number; percentage: number }>,
  additions: Array<{ office: string; count: number }>,
  maxItems: number = 5
) {
  const existingNames = new Set(existing.map(item => item.category))
  const enriched = [...existing]

  additions.forEach(office => {
    if (!existingNames.has(office.office)) {
      enriched.push({
        category: office.office,
        count: office.count,
        percentage: 0
      })
    }
  })

  const total = enriched.reduce((sum, item) => sum + item.count, 0) || 1
  const withPercentages = enriched.map(item => ({
    ...item,
    percentage: Math.round((item.count / total) * 100)
  }))
  return withPercentages.slice(0, maxItems)
}
