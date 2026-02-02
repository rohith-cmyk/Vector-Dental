'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardService, referralService } from '@/services/api'
import type { DashboardStats, Referral } from '@/types'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, LoadingState } from '@/components/ui'
import { ArrowUpRight, CheckCircle, Clock, XCircle, CheckCircle2 } from 'lucide-react'
import { ReferralProcessFlowChart } from '@/components/dashboard/ReferralProcessFlowChart'
import { OverviewMetrics } from '@/components/dashboard/OverviewMetrics'
import { ReferralTrendsChart } from '@/components/dashboard/ReferralTrendsChart'
import { BreakdownChart } from '@/components/dashboard/BreakdownChart'

interface TrendPoint {
    month: string
    sent: number
}

const MINUTES_IN_DAY = 24 * 60

const formatDuration = (minutes: number | null) => {
    if (!minutes || minutes <= 0 || Number.isNaN(minutes)) return '-'
    if (minutes >= MINUTES_IN_DAY) {
        const days = Math.floor(minutes / MINUTES_IN_DAY)
        const hours = Math.floor((minutes % MINUTES_IN_DAY) / 60)
        return `${days}d ${hours}h`
    }
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours === 0) return `${mins}m`
    return `${hours}h ${mins}m`
}

const averageMinutes = (values: number[]) => {
    if (!values.length) return null
    const total = values.reduce((sum, val) => sum + val, 0)
    return total / values.length
}

const diffMinutes = (start?: string | null, end?: string | null) => {
    if (!start || !end) return null
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null
    const minutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60)
    return minutes > 0 ? minutes : null
}

interface BreakdownPoint {
    category: string
    count: number
    percentage: number
}

const mockStats: DashboardStats = {
    total: 70,
    pending: 5,
    accepted: 27,
    completed: 20,
    rejected: 3,
}

const mockRecentReferrals: Referral[] = [
    {
        id: 'mock-1',
        patientFirstName: 'John',
        patientLastName: 'Doe',
        patientName: 'John Doe',
        patientDob: '1986-06-12',
        patientPhone: '(555) 555-0101',
        patientEmail: 'john.doe@example.com',
        insurance: null,
        reason: 'Orthodontic evaluation for braces',
        urgency: 'ROUTINE',
        status: 'SENT',
        selectedTeeth: [],
        notes: 'Prefers morning appointments',
        appointmentDate: null,
        appointmentNotes: null,
        patientAttendedAt: null,
        treatmentStartedAt: null,
        treatmentCompletedAt: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        intendedRecipient: {
            id: 'spec-1',
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@ortho.com',
            clinic: {
                id: 'clinic-1',
                name: 'Cuday Loyola',
                address: null,
                phone: null,
                email: null,
                logoUrl: null,
            },
        },
    },
    {
        id: 'mock-2',
        patientFirstName: 'Peter',
        patientLastName: 'Parker',
        patientName: 'Peter Parker',
        patientDob: '1992-07-22',
        patientPhone: '(555) 555-0102',
        patientEmail: 'peter.parker@example.com',
        insurance: null,
        reason: 'Oral surgery consultation',
        urgency: 'URGENT',
        status: 'ACCEPTED',
        selectedTeeth: [],
        notes: null,
        appointmentDate: null,
        appointmentNotes: null,
        patientAttendedAt: null,
        treatmentStartedAt: null,
        treatmentCompletedAt: null,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        intendedRecipient: {
            id: 'spec-2',
            name: 'Dr. Michael Chen',
            email: 'michael.chen@oralsurg.com',
            clinic: {
                id: 'clinic-2',
                name: 'Cuday',
                address: null,
                phone: null,
                email: null,
                logoUrl: null,
            },
        },
    },
    {
        id: 'mock-3',
        patientFirstName: 'Dylan',
        patientLastName: 'Gerstenhaber',
        patientName: 'Dylan Gerstenhaber',
        patientDob: '1988-05-18',
        patientPhone: '(555) 555-0103',
        patientEmail: 'dylan.gerstenhaber@example.com',
        insurance: null,
        reason: 'Root canal treatment',
        urgency: 'ROUTINE',
        status: 'COMPLETED',
        selectedTeeth: [],
        notes: null,
        appointmentDate: null,
        appointmentNotes: null,
        patientAttendedAt: null,
        treatmentStartedAt: null,
        treatmentCompletedAt: null,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        intendedRecipient: {
            id: 'spec-3',
            name: 'Dr. Emily Davis',
            email: 'emily.davis@perio.com',
            clinic: {
                id: 'clinic-3',
                name: 'Edgewater',
                address: null,
                phone: null,
                email: null,
                logoUrl: null,
            },
        },
    },
    {
        id: 'mock-4',
        patientFirstName: 'Sophia',
        patientLastName: 'Taylor',
        patientName: 'Sophia Taylor',
        patientDob: '2005-06-10',
        patientPhone: '(555) 555-0104',
        patientEmail: 'sophia.taylor@example.com',
        insurance: null,
        reason: 'Pediatric orthodontic consult',
        urgency: 'ROUTINE',
        status: 'REJECTED',
        selectedTeeth: [],
        notes: 'Family decided to reschedule',
        appointmentDate: null,
        appointmentNotes: null,
        patientAttendedAt: null,
        treatmentStartedAt: null,
        treatmentCompletedAt: null,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        intendedRecipient: {
            id: 'spec-4',
            name: 'Dr. Amanda Garcia',
            email: 'amanda.garcia@pediatric.com',
            clinic: {
                id: 'clinic-4',
                name: 'Dylan',
                address: null,
                phone: null,
                email: null,
                logoUrl: null,
            },
        },
    },
]

const mockReferrals: Referral[] = [
    ...mockRecentReferrals,
    {
        id: 'mock-5',
        patientFirstName: 'Olivia',
        patientLastName: 'Martinez',
        patientName: 'Olivia Martinez',
        patientDob: '1975-01-15',
        patientPhone: '(555) 555-0105',
        patientEmail: 'olivia.martinez@example.com',
        insurance: null,
        reason: 'Periodontal therapy consultation',
        urgency: 'ROUTINE',
        status: 'SENT',
        selectedTeeth: [],
        notes: null,
        appointmentDate: null,
        appointmentNotes: null,
        patientAttendedAt: null,
        treatmentStartedAt: null,
        treatmentCompletedAt: null,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        intendedRecipient: {
            id: 'spec-5',
            name: 'Dr. Lisa Wong',
            email: 'lisa.wong@perio.com',
            clinic: {
                id: 'clinic-5',
                name: 'DePaul Dentals',
                address: null,
                phone: null,
                email: null,
                logoUrl: null,
            },
        },
    },
    {
        id: 'mock-6',
        patientFirstName: 'James',
        patientLastName: 'Anderson',
        patientName: 'James Anderson',
        patientDob: '1990-08-20',
        patientPhone: '(555) 555-0106',
        patientEmail: 'james.anderson@example.com',
        insurance: null,
        reason: 'Endodontic evaluation',
        urgency: 'URGENT',
        status: 'ACCEPTED',
        selectedTeeth: [],
        notes: null,
        appointmentDate: null,
        appointmentNotes: null,
        patientAttendedAt: null,
        treatmentStartedAt: null,
        treatmentCompletedAt: null,
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        intendedRecipient: {
            id: 'spec-6',
            name: 'Dr. Robert Smith',
            email: 'robert.smith@endodontics.com',
            clinic: {
                id: 'clinic-6',
                name: 'Edgewater',
                address: null,
                phone: null,
                email: null,
                logoUrl: null,
            },
        },
    },
    {
        id: 'mock-7',
        patientFirstName: 'Emma',
        patientLastName: 'Thompson',
        patientName: 'Emma Thompson',
        patientDob: '1995-11-12',
        patientPhone: '(555) 555-0107',
        patientEmail: 'emma.thompson@example.com',
        insurance: null,
        reason: 'Oral surgery consult',
        urgency: 'EMERGENCY',
        status: 'COMPLETED',
        selectedTeeth: [],
        notes: null,
        appointmentDate: null,
        appointmentNotes: null,
        patientAttendedAt: null,
        treatmentStartedAt: null,
        treatmentCompletedAt: null,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        intendedRecipient: {
            id: 'spec-7',
            name: 'Dr. Emily Davis',
            email: 'emily.davis@oralsurg.com',
            clinic: {
                id: 'clinic-7',
                name: 'Cuday Loyola',
                address: null,
                phone: null,
                email: null,
                logoUrl: null,
            },
        },
    },
]

export default function DashboardPage() {
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [isLoading, setIsLoading] = useState(true)

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
            const [statsResponse, referralsResponse] = await Promise.all([
                dashboardService.getStats(),
                referralService.getMyReferrals({ limit: 200 }),
            ])
            setStats(statsResponse.data.stats)
            setReferrals(getReferralsList(referralsResponse.data))
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
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

    const hasRealStats =
        !!stats &&
        (stats.total > 0 ||
            stats.pending > 0 ||
            stats.accepted > 0 ||
            stats.completed > 0 ||
            stats.rejected > 0)
    const effectiveStats = hasRealStats ? stats : mockStats
    const effectiveReferrals = referrals.length > 0 ? referrals : mockReferrals
    const recentSourceReferrals = referrals

    const totalReferrals = effectiveStats.total || 0
    const acceptedReferrals = effectiveStats.accepted || 0
    const completedReferrals = effectiveStats.completed || 0
    const baseTotal = totalReferrals || 1
    const processFlowData = [
        { label: 'Referral Sent', count: totalReferrals, percentage: Math.round((totalReferrals / baseTotal) * 100) },
        { label: 'Accepted', count: acceptedReferrals, percentage: Math.round((acceptedReferrals / baseTotal) * 100) },
        { label: 'Completed', count: completedReferrals, percentage: Math.round((completedReferrals / baseTotal) * 100) },
    ]

    const trendData = buildMonthlyTrend(effectiveReferrals)
    const officeBreakdown = buildOfficeBreakdown(effectiveReferrals)
    const recentReferrals = recentSourceReferrals
        .filter((referral) => referral.status !== 'DRAFT' && referral.intendedRecipient?.id)
        .sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return bTime - aTime
        })
        .slice(0, 5)

    const now = new Date()
    const last30Days = effectiveReferrals.filter((referral) => {
        if (!referral.createdAt) return false
        const createdAt = new Date(referral.createdAt)
        return now.getTime() - createdAt.getTime() <= 30 * 24 * 60 * 60 * 1000
    })
    const dailyAverage = last30Days.length / 30

    const scheduleMinutes = effectiveReferrals
        .map((referral) => diffMinutes(referral.createdAt, referral.scheduledAt))
        .filter((value): value is number => value !== null)
    const appointmentMinutes = effectiveReferrals
        .map((referral) => diffMinutes(referral.scheduledAt, referral.completedAt))
        .filter((value): value is number => value !== null)
    const timeToTreatmentMinutes = effectiveReferrals
        .map((referral) => diffMinutes(referral.createdAt, referral.completedAt))
        .filter((value): value is number => value !== null)

    const avgSchedule = formatDuration(averageMinutes(scheduleMinutes))
    const avgAppointment = formatDuration(averageMinutes(appointmentMinutes))
    const avgTimeToTreatment = formatDuration(averageMinutes(timeToTreatmentMinutes))

    return (
        <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user.name}`}>
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="py-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-neutral-400">Total Referrals</p>
                                <ArrowUpRight className="h-5 w-5 text-neutral-400" />
                            </div>
                            <p className="text-3xl font-bold text-neutral-900 mt-2">{effectiveStats.total || 0}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-neutral-400">Pending Action</p>
                                <Clock className="h-5 w-5 text-neutral-400" />
                            </div>
                            <p className="text-3xl font-bold text-neutral-900 mt-2">{effectiveStats.pending || 0}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-neutral-400">Completed</p>
                                <CheckCircle2 className="h-5 w-5 text-neutral-400" />
                            </div>
                            <p className="text-3xl font-bold text-neutral-900 mt-2">{effectiveStats.completed || 0}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <OverviewMetrics
                        dailyAverage={dailyAverage}
                        avgSchedule={avgSchedule}
                        avgAppointment={avgAppointment}
                        avgTimeToTreatment={avgTimeToTreatment}
                    />
                    <div className="lg:col-span-2">
                        <ReferralProcessFlowChart data={processFlowData} />
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
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sent Referrals</h2>
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
                                            {recentReferrals.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-neutral-400">
                                                        No recent sent referrals yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                recentReferrals.map((referral) => (
                                                    <tr
                                                        key={referral.id}
                                                        className="hover:bg-neutral-50 transition-colors cursor-pointer"
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
