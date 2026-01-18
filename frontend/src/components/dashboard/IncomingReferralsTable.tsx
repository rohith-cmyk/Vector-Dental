'use client'

import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import { Search, Check } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { URGENCY_LEVELS } from '@/constants'
import type { Referral } from '@/types'

interface IncomingReferralsTableProps {
  referrals: Referral[]
  onAccept?: (id: string) => void
  onView?: (id: string) => void
  acceptingIds?: string[]
}

export function IncomingReferralsTable({ referrals, onAccept, onView, acceptingIds }: IncomingReferralsTableProps) {
  // Handle undefined or empty data
  const safeReferrals = referrals || []

  return (
    <div className="bg-white rounded-lg border border-black/10">
      <div className="flex flex-row items-center justify-between px-6 py-4 border-b border-black/10">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">Pending Incoming Referrals</h3>
          <p className="text-sm text-neutral-500 mt-1">Referrals sent to you that need your action</p>
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
            <p className="text-sm text-neutral-500">No pending incoming referrals</p>
            <p className="text-sm text-neutral-400 mt-1">You're all caught up! 🎉</p>
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
                    From Clinic
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                    Reason
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                    Urgency
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
                    Received
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
                        {referral.fromClinicName || 'Unknown Clinic'}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {referral.referringDentist && `Dr. ${referral.referringDentist}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-400 max-w-xs truncate" title={referral.reason}>
                        {referral.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          referral.urgency === 'emergency' ? 'danger' :
                          referral.urgency === 'urgent' ? 'warning' : 'default'
                        }
                      >
                        {referral.urgency.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {formatRelativeTime(referral.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => onAccept?.(referral.id)}
                          disabled={acceptingIds?.includes(referral.id)}
                        >
                          <Check className="h-4 w-4" />
                          {acceptingIds?.includes(referral.id) ? 'Accepting...' : 'Accept'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => onView?.(referral.id)}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-neutral-500">
                      No incoming referrals at this time
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

