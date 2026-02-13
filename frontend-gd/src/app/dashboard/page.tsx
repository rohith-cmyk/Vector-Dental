'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardService, referralService } from '@/services/api'
import type { DashboardStats, Referral } from '@/types'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, LoadingState, StatCard } from '@/components/ui'
import { ArrowUpRight, CheckCircle2, Clock } from 'lucide-react'
import { ReferralProcessFlowChart } from '@/components/dashboard/ReferralProcessFlowChart'
import { OverviewMetrics } from '@/components/dashboard/OverviewMetrics'
import { ReferralTrendsChart } from '@/components/dashboard/ReferralTrendsChart'
import { BreakdownChart } from '@/components/dashboard/BreakdownChart'

interface TrendPoint {
    month: string
    sent: number
}

interface BreakdownPoint {
    category: string
    count: number
    percentage: number
}

export default function DashboardPage() {
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [recentReferrals, setRecentReferrals] = useState<Referral[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [processFlowRange, setProcessFlowRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            loadDashboardData()
        }
    }, [user])

    const loadDashboardData = async () => {
        try {
            setError(null)
            const [dashboardResponse, referralsResponse] = await Promise.all([
                dashboardService.getStats(),
                referralService.getMyReferrals({ limit: 200 }),
            ])
            const dash = dashboardResponse.data
            setStats(dash.stats)
            setRecentReferrals(dash.recentReferrals || [])
            setReferrals(getReferralsList(referralsResponse.data))
        } catch (err) {
            console.error('Failed to load dashboard data:', err)
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
        } finally {
            setIsLoading(false)
        }
    }

    if (authLoading || isLoading) {
        return (
            <DashboardLayout title="Dashboard" subtitle="Loading your activity">
                <div className="flex items-center justify-center min-h-[360px]">
                    <LoadingState title="Loading dashboard..." subtitle="Fetching your latest updates" />
                </div>
            </DashboardLayout>
        )
    }

    if (!user) return null

    if (error) {
        return (
            <DashboardLayout title="Dashboard" subtitle="Dashboard">
                <div className="flex flex-col items-center justify-center min-h-[360px] space-y-4">
                    <div className="text-sm text-neutral-500">{error}</div>
                    <button
                        onClick={() => { setError(null); setIsLoading(true); loadDashboardData(); }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                    >
                        Try Again
                    </button>
                </div>
            </DashboardLayout>
        )
    }

    const effectiveStats = stats || {
        total: 0,
        pending: 0,
        accepted: 0,
        completed: 0,
        rejected: 0,
    }

    const totalReferrals = effectiveStats.total || 0
    const acceptedReferrals = effectiveStats.accepted || 0
    const completedReferrals = effectiveStats.completed || 0
    const baseTotal = totalReferrals || 1

    const processFlowData = [
        {
            label: 'Referrals Sent',
            footerLabel: 'Referrals Sent',
            count: totalReferrals,
            percentage: Math.round((totalReferrals / baseTotal) * 100),
        },
        {
            label: 'Accepted',
            footerLabel: 'Accepted',
            count: acceptedReferrals,
            percentage: Math.round((acceptedReferrals / baseTotal) * 100),
        },
        {
            label: 'Completed',
            footerLabel: 'Completed',
            count: completedReferrals,
            percentage: Math.round((completedReferrals / baseTotal) * 100),
        },
    ]

    const trendData = buildMonthlyTrend(referrals)
    const officeBreakdown = buildOfficeBreakdown(referrals)

    const recentTable = (recentReferrals.length > 0 ? recentReferrals : referrals)
        .filter((r) => r.status !== 'DRAFT' && r.intendedRecipient?.id)
        .sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return bTime - aTime
        })
        .slice(0, 5)

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const recentCount = referrals.filter((r) => new Date(r.createdAt || 0).getTime() >= thirtyDaysAgo).length
    const dailyAverage = recentCount / 30

    return (
        <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user.name}`}>
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        title="Total Referrals"
                        value={effectiveStats.total || 0}
                        icon={<ArrowUpRight className="h-5 w-5" />}
                        className="hover:shadow-lg transition-all duration-200 border-gray-200/60"
                    />
                    <StatCard
                        title="Pending Action"
                        value={effectiveStats.pending || 0}
                        icon={<Clock className="h-5 w-5" />}
                        className={`hover:shadow-lg transition-all duration-200 border-gray-200/60 ${
                            (effectiveStats.pending || 0) > 0 ? 'ring-1 ring-amber-200 bg-amber-50/30' : ''
                        }`}
                    />
                    <StatCard
                        title="Completed"
                        value={effectiveStats.completed || 0}
                        icon={<CheckCircle2 className="h-5 w-5" />}
                        className="hover:shadow-lg transition-all duration-200 border-gray-200/60"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <OverviewMetrics
                        dailyAverage={dailyAverage}
                        avgSchedule="-"
                        avgAppointment="-"
                        avgTimeToTreatment="-"
                    />
                    <div className="lg:col-span-2">
                        <ReferralProcessFlowChart
                            data={processFlowData}
                            period={processFlowRange}
                            onPeriodChange={setProcessFlowRange}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <ReferralTrendsChart data={trendData} />
                            </div>
                            <div className="lg:col-span-1">
                                <BreakdownChart data={officeBreakdown} title="By Office" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Outbound Referrals</h2>
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto rounded-lg">
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
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-black/5">
                                            {recentTable.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-neutral-400">
                                                        No recent sent referrals yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                recentTable.map((referral) => (
                                                    <tr
                                                        key={referral.id}
                                                        className="hover:bg-gray-100 transition-colors cursor-pointer"
                                                        onClick={() => router.push(`/referrals?openId=${referral.id}`)}
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-medium text-neutral-800">
                                                                {getPatientName(referral)}
                                                            </div>
                                                            <div className="text-xs text-neutral-500">
                                                                {referral.patientPhone || '—'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-medium text-neutral-800">
                                                                {referral.intendedRecipient?.name || 'Specialist'}
                                                            </div>
                                                            <div className="text-xs text-neutral-500">
                                                                {referral.intendedRecipient?.clinic?.name || '—'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-neutral-700 max-w-xs truncate">
                                                                {referral.reason}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold tracking ${
                                                                referral.status === 'COMPLETED'
                                                                    ? 'bg-green-100 text-green-500'
                                                                    : referral.status === 'ACCEPTED'
                                                                        ? 'bg-blue-100 text-blue-500'
                                                                        : referral.status === 'REJECTED' || referral.status === 'CANCELLED'
                                                                            ? 'bg-red-100 text-red-500'
                                                                            : 'bg-yellow-100 text-yellow-500'
                                                            }`}>
                                                                {(referral.status || '').toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-neutral-500" suppressHydrationWarning>
                                                            {referral.createdAt ? formatRelativeTime(referral.createdAt) : '—'}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

function getReferralsList(payload: unknown): Referral[] {
    if (!payload || typeof payload !== 'object') return []
    if (Array.isArray(payload)) return payload as Referral[]
    const record = payload as Record<string, unknown>
    if (Array.isArray(record.referrals)) return record.referrals as Referral[]
    if (Array.isArray(record.items)) return record.items as Referral[]
    const firstArray = Object.values(record).find(Array.isArray)
    return (firstArray as Referral[]) || []
}

function buildMonthlyTrend(referrals: Referral[]): TrendPoint[] {
    const now = new Date()
    const buckets = new Map<string, { label: string; count: number }>()

    for (let i = 11; i >= 0; i -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${date.getFullYear()}-${date.getMonth()}`
        const label = date.toLocaleString('en-US', { month: 'short' })
        buckets.set(key, { label, count: 0 })
    }

    referrals.forEach((referral) => {
        if (!referral.createdAt) return
        const date = new Date(referral.createdAt)
        const key = `${date.getFullYear()}-${date.getMonth()}`
        const bucket = buckets.get(key)
        if (bucket) {
            bucket.count += 1
        }
    })

    return Array.from(buckets.values()).map((bucket) => ({
        month: bucket.label,
        sent: bucket.count,
    }))
}

function buildOfficeBreakdown(referrals: Referral[]): BreakdownPoint[] {
    const totals = new Map<string, number>()
    referrals.forEach((referral) => {
        const office =
            referral.intendedRecipient?.clinic?.name ||
            referral.intendedRecipient?.name ||
            'Unknown'
        totals.set(office, (totals.get(office) || 0) + 1)
    })

    const totalCount = Array.from(totals.values()).reduce((sum, count) => sum + count, 0)
    const safeTotal = totalCount || 1

    return Array.from(totals.entries())
        .map(([category, count]) => ({
            category,
            count,
            percentage: Math.round((count / safeTotal) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
}

function getPatientName(referral: Referral) {
    if (referral.patientName) return referral.patientName
    const parts = [referral.patientFirstName, referral.patientLastName].filter(Boolean)
    return parts.length ? parts.join(' ') : 'Unknown'
}

function formatRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

    return d.toLocaleDateString()
}
