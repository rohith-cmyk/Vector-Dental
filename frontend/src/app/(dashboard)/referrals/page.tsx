'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, CardContent, Badge, Select, Tabs } from '@/components/ui'
import { Plus, Search, Eye, Edit, Trash2, ArrowDownLeft, ArrowUpRight, CheckCircle, XCircle } from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { REFERRAL_STATUSES } from '@/constants'
import type { Referral, ReferralStatus } from '@/types'

export default function ReferralsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'all'>('all')

  // Mock data - Incoming Referrals
  const incomingReferrals: Referral[] = [
    {
      id: 'inc-1',
      referralType: 'incoming',
      fromClinicId: 'clinic-1',
      fromClinicName: 'Oak Street Dental',
      referringDentist: 'Sarah Johnson',
      patientName: 'John Doe',
      patientDob: '1985-03-15',
      patientPhone: '(555) 111-2222',
      reason: 'Orthodontic evaluation needed',
      urgency: 'urgent',
      status: 'sent',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'inc-2',
      referralType: 'incoming',
      fromClinicId: 'clinic-2',
      fromClinicName: 'Pine Dental Clinic',
      referringDentist: 'Michael Chen',
      patientName: 'Jane Smith',
      patientDob: '1992-07-22',
      patientPhone: '(555) 333-4444',
      reason: 'Wisdom tooth removal',
      urgency: 'routine',
      status: 'sent',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]

  // Mock data - Outgoing Referrals
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
      reason: 'Adult braces consultation',
      urgency: 'routine',
      status: 'accepted',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]

  const loading = false

  function getStatusBadgeVariant(status: ReferralStatus) {
    switch (status) {
      case 'completed': return 'success'
      case 'sent': return 'info'
      case 'accepted': return 'warning'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

  function getUrgencyBadgeVariant(urgency: string) {
    switch (urgency) {
      case 'emergency': return 'danger'
      case 'urgent': return 'warning'
      default: return 'default'
    }
  }

  const pendingIncomingCount = incomingReferrals.filter(r => r.status === 'sent').length

  return (
    <DashboardLayout title="Referrals">
      <div className="space-y-6">
        {/* Tabs for Received vs Sent */}
        <Tabs
          tabs={[
            { 
              id: 'received', 
              label: 'Received', 
              icon: <ArrowDownLeft className="h-4 w-4" />,
              badge: pendingIncomingCount
            },
            { 
              id: 'sent', 
              label: 'Sent', 
              icon: <ArrowUpRight className="h-4 w-4" />
            },
          ]}
          defaultTab="received"
        >
          {(activeTab) => (
            <>
              {/* Header Actions */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Search ${activeTab} referrals...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ReferralStatus | 'all')}
                    options={[
                      { value: 'all', label: 'All Status' },
                      { value: 'draft', label: 'Draft' },
                      { value: 'sent', label: 'Sent' },
                      { value: 'accepted', label: 'Accepted' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'cancelled', label: 'Cancelled' },
                    ]}
                  />
                </div>
                {activeTab === 'sent' && (
                  <Button variant="primary" className="gap-2">
                    <Plus className="h-5 w-5" />
                    New Referral
                  </Button>
                )}
              </div>

              {/* Referrals Table - Changes Based on Tab */}
              <Card>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-gray-500">Loading...</div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      {activeTab === 'received' ? (
                        // RECEIVED REFERRALS TABLE
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Patient
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                From Clinic
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Reason
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Urgency
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Received
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {incomingReferrals.map((referral) => (
                              <tr key={referral.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {referral.patientName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {referral.patientPhone}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {referral.fromClinicName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Dr. {referral.referringDentist}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-700 max-w-xs truncate">
                                    {referral.reason}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant={getUrgencyBadgeVariant(referral.urgency)}>
                                    {referral.urgency.toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant={getStatusBadgeVariant(referral.status)}>
                                    {referral.status.toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {formatRelativeTime(referral.createdAt)}
                                </td>
                                <td className="px-6 py-4 text-right text-sm">
                                  <div className="flex items-center justify-end gap-2">
                                    {referral.status === 'sent' && (
                                      <>
                                        <button className="px-3 py-1 text-xs bg-brand-500 text-white rounded-lg hover:bg-brand-600 flex items-center gap-1">
                                          <CheckCircle className="h-3 w-3" />
                                          Accept
                                        </button>
                                        <button className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-1">
                                          <XCircle className="h-3 w-3" />
                                          Reject
                                        </button>
                                      </>
                                    )}
                                    <button className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg">
                                      <Eye className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        // SENT REFERRALS TABLE
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Patient
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                To Specialist
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Reason
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Urgency
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Sent
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {outgoingReferrals.map((referral) => (
                              <tr key={referral.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {referral.patientName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {referral.patientPhone}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {referral.contact?.name || 'N/A'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {referral.contact?.specialty}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-700 max-w-xs truncate">
                                    {referral.reason}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant={getUrgencyBadgeVariant(referral.urgency)}>
                                    {referral.urgency.toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant={getStatusBadgeVariant(referral.status)}>
                                    {referral.status.toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {formatRelativeTime(referral.createdAt)}
                                </td>
                                <td className="px-6 py-4 text-right text-sm">
                                  <div className="flex items-center justify-end gap-2">
                                    <button className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg">
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    {referral.status === 'draft' && (
                                      <>
                                        <button className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg">
                                          <Edit className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

