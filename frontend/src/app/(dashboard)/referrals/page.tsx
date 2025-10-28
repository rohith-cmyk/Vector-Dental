'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, CardContent, Badge, Select } from '@/components/ui'
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'
import { referralsService } from '@/services/referrals.service'
import { formatDate } from '@/lib/utils'
import { REFERRAL_STATUSES, URGENCY_LEVELS } from '@/constants'
import type { Referral, ReferralStatus } from '@/types'

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'all'>('all')

  useEffect(() => {
    fetchReferrals()
  }, [])

  async function fetchReferrals() {
    try {
      const data = await referralsService.getAll()
      setReferrals(data.data)
    } catch (error) {
      console.error('Failed to fetch referrals:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = 
      referral.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.reason.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || referral.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  function getStatusBadgeVariant(status: ReferralStatus) {
    switch (status) {
      case 'COMPLETED': return 'success'
      case 'SENT': return 'info'
      case 'ACCEPTED': return 'warning'
      case 'CANCELLED': return 'danger'
      default: return 'default'
    }
  }

  function getUrgencyBadgeVariant(urgency: string) {
    switch (urgency) {
      case 'EMERGENCY': return 'danger'
      case 'URGENT': return 'warning'
      default: return 'default'
    }
  }

  return (
    <DashboardLayout title="Referrals">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search referrals..."
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
                { value: 'DRAFT', label: 'Draft' },
                { value: 'SENT', label: 'Sent' },
                { value: 'ACCEPTED', label: 'Accepted' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
            />
          </div>
          <Button variant="primary" className="gap-2">
            <Plus className="h-5 w-5" />
            New Referral
          </Button>
        </div>

        {/* Referrals Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : filteredReferrals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-gray-500">No referrals found</p>
                <Button variant="primary" className="mt-4 gap-2">
                  <Plus className="h-5 w-5" />
                  Create Your First Referral
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Specialist
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
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReferrals.map((referral) => (
                      <tr key={referral.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {referral.patientName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(referral.patientDob)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {referral.contact?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 max-w-xs truncate">
                            {referral.reason}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getUrgencyBadgeVariant(referral.urgency)}>
                            {referral.urgency}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusBadgeVariant(referral.status)}>
                            {REFERRAL_STATUSES[referral.status].label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(referral.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

