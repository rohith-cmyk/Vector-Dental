'use client'

import { DashboardLayout } from '@/components/layout'
import { StatsCardsV2 } from '@/components/dashboard/StatsCardsV2'
import { ReferralTrendsChart } from '@/components/dashboard/ReferralTrendsChart'
import { SpecialtyBreakdown } from '@/components/dashboard/SpecialtyBreakdown'
import { IncomingReferralsTable } from '@/components/dashboard/IncomingReferralsTable'
import { OutgoingReferralsTable } from '@/components/dashboard/OutgoingReferralsTable'
import type { Referral } from '@/types'

export default function DashboardPage() {
  // Mock data for two-way referral system
  const stats = {
    totalReferrals: 124,
    totalOutgoing: 77,      // Referrals sent out
    totalIncoming: 47,      // Referrals received
    pendingIncoming: 12,    // Need your action
    pendingOutgoing: 8,     // Waiting for specialist
    completedThisMonth: 23,
    referralsBySpecialty: [
      { specialty: 'Orthodontics', count: 45, percentage: 36 },
      { specialty: 'Oral Surgery', count: 32, percentage: 26 },
      { specialty: 'Periodontics', count: 28, percentage: 23 },
      { specialty: 'Endodontics', count: 19, percentage: 15 },
    ],
    referralTrends: [
      { month: 'Jan', outgoing: 8, incoming: 4 },
      { month: 'Feb', outgoing: 12, incoming: 6 },
      { month: 'Mar', outgoing: 15, incoming: 8 },
      { month: 'Apr', outgoing: 18, incoming: 10 },
      { month: 'May', outgoing: 22, incoming: 12 },
      { month: 'Jun', outgoing: 25, incoming: 14 },
      { month: 'Jul', outgoing: 28, incoming: 16 },
      { month: 'Aug', outgoing: 32, incoming: 18 },
      { month: 'Sep', outgoing: 30, incoming: 16 },
      { month: 'Oct', outgoing: 35, incoming: 20 },
      { month: 'Nov', outgoing: 38, incoming: 22 },
      { month: 'Dec', outgoing: 42, incoming: 24 },
    ]
  }

  // Mock incoming referrals (from other clinics to you)
  const incomingReferrals: Referral[] = [
    {
      id: 'inc-1',
      referralType: 'incoming',
      fromClinicId: 'clinic-1',
      fromClinicName: 'Oak Street Dental',
      fromClinicEmail: 'info@oakstreetdental.com',
      fromClinicPhone: '(555) 234-5678',
      referringDentist: 'Sarah Johnson',
      patientName: 'John Doe',
      patientDob: '1985-03-15',
      patientPhone: '(555) 111-2222',
      patientEmail: 'john.doe@email.com',
      reason: 'Patient needs orthodontic evaluation for severe crowding',
      urgency: 'urgent',
      status: 'sent',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'inc-2',
      referralType: 'incoming',
      fromClinicId: 'clinic-2',
      fromClinicName: 'Pine Dental Clinic',
      fromClinicEmail: 'contact@pinedental.com',
      fromClinicPhone: '(555) 345-6789',
      referringDentist: 'Michael Chen',
      patientName: 'Jane Smith',
      patientDob: '1992-07-22',
      patientPhone: '(555) 333-4444',
      reason: 'Impacted wisdom tooth removal needed',
      urgency: 'routine',
      status: 'sent',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      updatedAt: new Date().toISOString(),
    }
  ]

  // Mock outgoing referrals (you sent to specialists)
  const outgoingReferrals: Referral[] = [
    {
      id: 'out-1',
      referralType: 'outgoing',
      fromClinicId: 'my-clinic',
      toContactId: 'contact-1',
      contact: {
        id: 'contact-1',
        name: 'Dr. Brian Fred M.',
        specialty: 'Orthodontics',
        email: 'brianfred@email.com',
        phone: '(319) 555-0115',
        status: 'ACTIVE',
        clinicId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      patientName: 'Bob Wilson',
      patientDob: '1978-11-30',
      patientPhone: '(555) 777-8888',
      reason: 'Orthodontic consultation for adult braces',
      urgency: 'routine',
      status: 'accepted',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'out-2',
      referralType: 'outgoing',
      fromClinicId: 'my-clinic',
      toContactId: 'contact-2',
      contact: {
        id: 'contact-2',
        name: 'Dr. Courtney Henry',
        specialty: 'Oral Surgery',
        email: 'courtney.h@email.com',
        phone: '(405) 555-0128',
        status: 'ACTIVE',
        clinicId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      patientName: 'Alice Brown',
      patientDob: '1995-05-18',
      patientPhone: '(555) 999-0000',
      reason: 'Wisdom teeth extraction',
      urgency: 'routine',
      status: 'sent',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      updatedAt: new Date().toISOString(),
    }
  ]

  const loading = false

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
        {/* Stats Cards - Updated for Two-Way System */}
        <StatsCardsV2
          stats={{
            totalOutgoing: stats.totalOutgoing,
            totalIncoming: stats.totalIncoming,
            pendingIncoming: stats.pendingIncoming,
            completedThisMonth: stats.completedThisMonth,
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
          referrals={incomingReferrals}
          onAccept={handleAcceptReferral}
          onReject={handleRejectReferral}
        />

        {/* Outgoing Referrals - Track Status */}
        <OutgoingReferralsTable 
          referrals={outgoingReferrals}
          onView={handleViewReferral}
        />
      </div>
    </DashboardLayout>
  )
}

