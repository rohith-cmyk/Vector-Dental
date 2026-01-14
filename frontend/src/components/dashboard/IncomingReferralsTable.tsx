'use client'

import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import { Search, CheckCircle, Eye } from 'lucide-react'
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>🔔 Pending Incoming Referrals</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Referrals sent to you that need your action</p>
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
            <p className="text-gray-500">No pending incoming referrals</p>
            <p className="text-sm text-gray-400 mt-1">You're all caught up! 🎉</p>
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
                    From Clinic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received
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
                        {referral.fromClinicName || 'Unknown Clinic'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {referral.referringDentist && `Dr. ${referral.referringDentist}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs truncate" title={referral.reason}>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatRelativeTime(referral.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          className="gap-1"
                          onClick={() => onAccept?.(referral.id)}
                          disabled={acceptingIds?.includes(referral.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          {acceptingIds?.includes(referral.id) ? 'Accepting...' : 'Accept'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => onView?.(referral.id)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No incoming referrals at this time
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

