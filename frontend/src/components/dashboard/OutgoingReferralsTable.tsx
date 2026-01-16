'use client'

import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { Search, Eye } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { REFERRAL_STATUSES } from '@/constants'
import type { Referral, ReferralStatus } from '@/types'

interface OutgoingReferralsTableProps {
  referrals: Referral[]
  onView?: (id: string) => void
}

export function OutgoingReferralsTable({ referrals, onView }: OutgoingReferralsTableProps) {
  // Handle undefined or empty data
  const safeReferrals = referrals || []
  
  function getStatusBadgeVariant(status: ReferralStatus) {
    switch (status) {
      case 'completed': return 'success'
      case 'sent': return 'info'
      case 'accepted': return 'warning'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Outgoing Referrals</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Referrals you sent to specialists</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search referrals..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {safeReferrals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500">No recent outgoing referrals</p>
            <p className="text-sm text-gray-400 mt-1">Start by creating a new referral</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To Specialist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeReferrals.length > 0 ? safeReferrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{referral.patientName}</div>
                      <div className="text-xs text-gray-500">{referral.patientPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {referral.contact?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">{referral.contact?.specialty}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs truncate" title={referral.reason}>
                        {referral.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(referral.status)}>
                        {REFERRAL_STATUSES[referral.status]?.label || referral.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatRelativeTime(referral.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => onView?.(referral.id)}
                        className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No outgoing referrals yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

