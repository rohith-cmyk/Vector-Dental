'use client'

import { DashboardLayout } from '@/components/layout'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { ReferralTrendsChart } from '@/components/dashboard/ReferralTrendsChart'
import { SpecialtyBreakdown } from '@/components/dashboard/SpecialtyBreakdown'
import { ContactsList } from '@/components/dashboard/ContactsList'

export default function DashboardPage() {
  // Mock data for development
  const stats = {
    totalReferrals: 124,
    pendingReferrals: 15,
    completedThisMonth: 23,
    referralsBySpecialty: [
      { specialty: 'Orthodontics', count: 45, percentage: 36 },
      { specialty: 'Oral Surgery', count: 32, percentage: 26 },
      { specialty: 'Periodontics', count: 28, percentage: 23 },
      { specialty: 'Endodontics', count: 19, percentage: 15 },
    ],
    referralTrends: [
      { month: 'Jan', count: 8 },
      { month: 'Feb', count: 12 },
      { month: 'Mar', count: 15 },
      { month: 'Apr', count: 18 },
      { month: 'May', count: 22 },
      { month: 'Jun', count: 25 },
      { month: 'Jul', count: 28 },
      { month: 'Aug', count: 32 },
      { month: 'Sep', count: 30 },
      { month: 'Oct', count: 35 },
      { month: 'Nov', count: 38 },
      { month: 'Dec', count: 42 },
    ]
  }

  const contacts = [
    {
      id: '1',
      name: 'Dr. Brian Fred M.',
      specialty: 'Orthodontics',
      email: 'brianfred@email.com',
      phone: '(319) 555-0115',
      status: 'ACTIVE' as const,
      clinicId: '1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      lastAccess: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      name: 'Dr. Courtney Henry',
      specialty: 'Oral Surgery',
      email: 'courtney.h@email.com',
      phone: '(405) 555-0128',
      status: 'ACTIVE' as const,
      clinicId: '1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      lastAccess: '2024-01-20T09:15:00Z'
    }
  ]

  const loading = false

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
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
        {/* Stats Cards */}
        <StatsCards
          stats={{
            totalReferrals: stats.totalReferrals,
            pendingReferrals: stats.pendingReferrals,
            completedThisMonth: stats.completedThisMonth,
          }}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ReferralTrendsChart data={stats.referralTrends} />
          </div>
          <div className="lg:col-span-1">
            <SpecialtyBreakdown data={stats.referralsBySpecialty} />
          </div>
        </div>

        {/* Contacts List */}
        <ContactsList contacts={contacts} />
      </div>
    </DashboardLayout>
  )
}

