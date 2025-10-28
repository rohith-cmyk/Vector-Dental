'use client'

import { StatCard } from '@/components/ui'
import { FileText, Clock, CheckCircle } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalReferrals: number
    pendingReferrals: number
    completedThisMonth: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Referrals"
        value={stats.totalReferrals}
        change={16}
        icon={<FileText className="h-5 w-5" />}
      />
      <StatCard
        title="Pending Referrals"
        value={stats.pendingReferrals}
        change={16}
        icon={<Clock className="h-5 w-5" />}
      />
      <StatCard
        title="Completed This Month"
        value={stats.completedThisMonth}
        change={16}
        icon={<CheckCircle className="h-5 w-5" />}
      />
    </div>
  )
}

