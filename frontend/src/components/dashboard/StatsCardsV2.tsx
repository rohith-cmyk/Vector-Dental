'use client'

import { StatCard } from '@/components/ui'
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle } from 'lucide-react'

interface StatsCardsV2Props {
  stats: {
    totalOutgoing: number
    totalIncoming: number
    pendingIncoming: number
    completedThisMonth: number
    outgoingChange?: number
    incomingChange?: number
    completedChange?: number
  }
}

export function StatsCardsV2({ stats }: StatsCardsV2Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Sent Out"
          value={stats.totalOutgoing}
          change={stats.outgoingChange}
          icon={<ArrowUpRight className="h-5 w-5" />}
          className="hover:shadow-lg transition-all duration-200 border-gray-200/60"
        />
        <StatCard
          title="Received"
          value={stats.totalIncoming}
          change={stats.incomingChange}
          icon={<ArrowDownLeft className="h-5 w-5" />}
          className="hover:shadow-lg transition-all duration-200 border-gray-200/60"
        />
        <StatCard
          title="Pending Action"
          value={stats.pendingIncoming}
          icon={<Clock className="h-5 w-5" />}
          className={`hover:shadow-lg transition-all duration-200 border-gray-200/60 ${
            stats.pendingIncoming > 0 ? 'ring-1 ring-amber-200 bg-amber-50/30' : ''
          }`}
        />
        <StatCard
          title="Completed This Month"
          value={stats.completedThisMonth}
          change={stats.completedChange}
          icon={<CheckCircle className="h-5 w-5" />}
          className="hover:shadow-lg transition-all duration-200 border-gray-200/60"
        />
    </div>
  )
}

