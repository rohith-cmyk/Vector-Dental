'use client'

import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { Search, Check } from 'lucide-react'
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
      case 'COMPLETED': return 'success'
      case 'SENT': return 'info'
      case 'ACCEPTED': return 'warning'
      case 'CANCELLED': return 'danger'
      default: return 'default'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-black/10">
      <div className="flex flex-row items-center justify-between px-6 py-4 border-b border-black/10">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">📤 Recent Outgoing Referrals</h3>
          <p className="text-sm text-neutral-500 mt-1">Referrals you sent to specialists</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search referrals..."
              className="pl-10 pr-4 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-100 bg-white"
            />
          </div>
        </div>
      </div>
      <div className="p-0">
        {safeReferrals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-neutral-500">No recent outgoing referrals</p>
            <p className="text-sm text-neutral-400 mt-1">Start by creating a new referral</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-b-lg">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                    To Specialist
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                    Reason
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                    Sent
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-neutral-400 tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-black/5">
                {safeReferrals.length > 0 ? safeReferrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-700">{referral.patientName}</div>
                      <div className="text-xs text-neutral-500">{referral.patientPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-700">
                        {referral.contact?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-neutral-500">{referral.contact?.specialty}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-400 max-w-xs truncate" title={referral.reason}>
                        {referral.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(referral.status)}>
                        {REFERRAL_STATUSES[referral.status]?.label || referral.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {formatRelativeTime(referral.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => onView?.(referral.id)}
                        className="p-2 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-neutral-500">
                      No outgoing referrals yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

