'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, CardContent, Badge, Select, Tabs } from '@/components/ui'
import { NewReferralModal } from '@/components/referrals/NewReferralModal'
import { ReferralDetailsModal } from '@/components/referrals/ReferralDetailsModal'
import { Plus, Search, Eye, Edit, Trash2, ArrowDownLeft, ArrowUpRight, CheckCircle, XCircle } from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { REFERRAL_STATUSES } from '@/constants'
import type { Referral, ReferralStatus } from '@/types'
import { api } from '@/lib/api'

export default function ReferralsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'all'>('all')
  const [isNewReferralModalOpen, setIsNewReferralModalOpen] = useState(false)
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [activeTab, setActiveTab] = useState('received')

  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  // Fetch referrals
  const fetchReferrals = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = {
        type: activeTab,
        limit: 50, // Get more for list view
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      if (searchQuery) {
        params.search = searchQuery
      }

      const response = await api.get('/referrals', { params })
      if (response.data.success) {
        setReferrals(response.data.data)
        setTotal(response.data.total)
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error)
    } finally {
      setLoading(false)
    }
  }, [activeTab, statusFilter, searchQuery])

  // Initial fetch and refetch on filters change
  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchReferrals()
    }, 300)

    return () => clearTimeout(timer)
  }, [fetchReferrals])

  // Handle status update
  const handleStatusUpdate = async (id: string, newStatus: ReferralStatus) => {
    try {
      await api.patch(`/referrals/${id}/status`, { status: newStatus })
      fetchReferrals()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  function getStatusBadgeVariant(status: ReferralStatus) {
    if (!status) return 'default'
    switch (status) {
      case 'COMPLETED': return 'success'
      case 'SENT': return 'info'
      case 'ACCEPTED': return 'warning'
      case 'CANCELLED': return 'danger'
      default: return 'default'
    }
  }

  function getUrgencyBadgeVariant(urgency: string) {
    if (!urgency) return 'default'
    switch (urgency) {
      case 'EMERGENCY': return 'danger'
      case 'URGENT': return 'warning'
      default: return 'default'
    }
  }

  // Count strictly pending incoming for badge
  // Note: This matches dashboard logic but for the badge we might want a separate API call or just rely on current list if loaded
  // For now, let's use a simpler approach or rely on dashboard stats if available.
  // Ideally, we'd fetch the count separately.
  const pendingIncomingCount = 0 // TODO: Fetch from stats API?

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
              // badge: pendingIncomingCount // Optional: re-enable if we have count
            },
            {
              id: 'sent',
              label: 'Sent',
              icon: <ArrowUpRight className="h-4 w-4" />
            },
          ]}
          defaultTab="received"
          onChange={setActiveTab}
        >
          {() => ( // We ignore the render prop argument and use state
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
                  <Button
                    variant="primary"
                    className="gap-2"
                    onClick={() => setIsNewReferralModalOpen(true)}
                  >
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
                  ) : referrals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <p>No referrals found</p>
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
                            {referrals.map((referral) => (
                              <tr
                                key={referral.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => setSelectedReferral(referral)}
                              >
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
                                    {referral.fromClinicName || referral.clinic?.name || 'Unknown'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {referral.referringDentist ? `Dr. ${referral.referringDentist}` : ''}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-700 max-w-xs truncate">
                                    {referral.reason}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant={getUrgencyBadgeVariant(referral.urgency)}>
                                    {(referral.urgency || '').toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant={getStatusBadgeVariant(referral.status)}>
                                    {(referral.status || '').toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500" suppressHydrationWarning>
                                  {referral.createdAt && formatRelativeTime(referral.createdAt)}
                                </td>
                                <td className="px-6 py-4 text-right text-sm">
                                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                    {referral.status === 'SENT' && (
                                      <>
                                        <button
                                          onClick={() => handleStatusUpdate(referral.id, 'ACCEPTED')}
                                          className="px-3 py-1 text-xs bg-brand-500 text-white rounded-lg hover:bg-brand-600 flex items-center gap-1"
                                        >
                                          <CheckCircle className="h-3 w-3" />
                                          Accept
                                        </button>
                                        <button
                                          onClick={() => handleStatusUpdate(referral.id, 'REJECTED')}
                                          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-1"
                                        >
                                          <XCircle className="h-3 w-3" />
                                          Reject
                                        </button>
                                      </>
                                    )}
                                    <button
                                      onClick={() => setSelectedReferral(referral)}
                                      className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg"
                                    >
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
                            {referrals.map((referral) => (
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
                                    {referral.contact ? referral.contact.name : 'N/A'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {referral.contact ? referral.contact.specialty : ''}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-700 max-w-xs truncate">
                                    {referral.reason}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant={getUrgencyBadgeVariant(referral.urgency)}>
                                    {(referral.urgency || '').toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant={getStatusBadgeVariant(referral.status)}>
                                    {(referral.status || '').toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500" suppressHydrationWarning>
                                  {referral.createdAt && formatRelativeTime(referral.createdAt)}
                                </td>
                                <td className="px-6 py-4 text-right text-sm">
                                  <div className="flex items-center justify-end gap-2">
                                    <button className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg">
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    {referral.status === 'DRAFT' && (
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

        {/* Details Modal */}
        <ReferralDetailsModal
          isOpen={!!selectedReferral}
          onClose={() => setSelectedReferral(null)}
          referral={selectedReferral}
        />

        {/* New Referral Modal */}
        <NewReferralModal
          isOpen={isNewReferralModalOpen}
          onClose={() => setIsNewReferralModalOpen(false)}
          onSuccess={() => {
            fetchReferrals()
            setIsNewReferralModalOpen(false)
          }}
        />
      </div>
    </DashboardLayout>
  )
}

