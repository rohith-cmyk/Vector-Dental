import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'

/**
 * Get dashboard statistics for two-way referral system
 */
export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    // Get clinic ID from authenticated user
    const clinicId = req.user?.clinicId

    if (!clinicId) {
      // This should be caught by auth middleware, but double check
      throw new Error('User does not belong to a clinic')
    }

    // Get current date info
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const monthStart = new Date(currentYear, currentMonth, 1)
    const monthEnd = new Date(currentYear, currentMonth + 1, 1)
    const daysElapsedInMonth = Math.max(
      1,
      Math.ceil((now.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24))
    )

    const normalizePeriod = (value: unknown): 'monthly' | 'weekly' | 'yearly' => {
      if (value === 'weekly' || value === 'yearly' || value === 'monthly') return value
      return 'monthly'
    }

    const trendsPeriod = normalizePeriod(req.query.trendsPeriod)
    const specialtyPeriod = normalizePeriod(req.query.specialtyPeriod)

    // Total referrals (all)
    const totalReferrals = await prisma.referral.count({
      where: { fromClinicId: clinicId },
    })

    // Total outgoing referrals (sent by you)
    const totalOutgoing = await prisma.referral.count({
      where: {
        fromClinicId: clinicId,
        referralType: 'OUTGOING',
      },
    })

    // Total incoming referrals (received by you)
    const totalIncoming = await prisma.referral.count({
      where: {
        OR: [
          { fromClinicId: clinicId, referralType: 'INCOMING' },
          { toClinicId: clinicId }
        ]
      },
    })

    const totalIncomingThisMonth = await prisma.referral.count({
      where: {
        OR: [
          { fromClinicId: clinicId, referralType: 'INCOMING' },
          { toClinicId: clinicId }
        ],
        createdAt: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
    })

    // Pending incoming (need your action to accept/reject)
    const pendingStatuses: Array<'SUBMITTED' | 'SENT'> = ['SUBMITTED', 'SENT']
    const pendingIncoming = await prisma.referral.count({
      where: {
        status: { in: pendingStatuses },
        OR: [
          { fromClinicId: clinicId, referralType: 'INCOMING' },
          { toClinicId: clinicId }
        ]
      },
    })

    // Pending outgoing (waiting for specialist response)
    const pendingOutgoing = await prisma.referral.count({
      where: {
        fromClinicId: clinicId,
        referralType: 'OUTGOING',
        status: { in: ['SENT', 'ACCEPTED'] }, // Sent or in progress
      },
    })

    // Completed this month
    const completedThisMonth = await prisma.referral.count({
      where: {
        status: 'COMPLETED',
        OR: [
          { fromClinicId: clinicId },
          { toClinicId: clinicId },
        ],
        updatedAt: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
    })

    // Calculate percentage changes (current month vs previous month)
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Previous month outgoing count
    const previousOutgoing = await prisma.referral.count({
      where: {
        fromClinicId: clinicId,
        referralType: 'OUTGOING',
        createdAt: {
          gte: new Date(previousMonthYear, previousMonth, 1),
          lt: new Date(previousMonthYear, previousMonth + 1, 1),
        },
      },
    })

    // Current month outgoing count (for comparison)
    const currentMonthOutgoing = await prisma.referral.count({
      where: {
        fromClinicId: clinicId,
        referralType: 'OUTGOING',
        createdAt: {
          gte: new Date(currentYear, currentMonth, 1),
          lt: new Date(currentYear, currentMonth + 1, 1),
        },
      },
    })

    // Previous month incoming count
    const previousIncoming = await prisma.referral.count({
      where: {
        createdAt: {
          gte: new Date(previousMonthYear, previousMonth, 1),
          lt: new Date(previousMonthYear, previousMonth + 1, 1),
        },
        OR: [
          { fromClinicId: clinicId, referralType: 'INCOMING' },
          { toClinicId: clinicId },
        ],
      },
    })

    // Current month incoming count
    const currentMonthIncoming = await prisma.referral.count({
      where: {
        createdAt: {
          gte: new Date(currentYear, currentMonth, 1),
          lt: new Date(currentYear, currentMonth + 1, 1),
        },
        OR: [
          { fromClinicId: clinicId, referralType: 'INCOMING' },
          { toClinicId: clinicId }
        ]
      },
    })

    // Previous month completed count
    const previousCompleted = await prisma.referral.count({
      where: {
        fromClinicId: clinicId,
        status: 'COMPLETED',
        updatedAt: {
          gte: new Date(previousMonthYear, previousMonth, 1),
          lt: new Date(previousMonthYear, previousMonth + 1, 1),
        },
      },
    })

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const outgoingChange = calculateChange(currentMonthOutgoing, previousOutgoing)
    const incomingChange = calculateChange(currentMonthIncoming, previousIncoming)
    const completedChange = calculateChange(completedThisMonth, previousCompleted)

    // Referrals by specialty (Outgoing)
    const outgoingBySpecialty = await prisma.referral.groupBy({
      by: ['toContactId'],
      where: {
        fromClinicId: clinicId,
        referralType: 'OUTGOING',
        toContactId: { not: null },
      },
      _count: true,
    })

    // Get contact details for outgoing specialties
    const contactIds = outgoingBySpecialty
      .map((r) => r.toContactId)
      .filter((id): id is string => id !== null)

    const contacts = await prisma.contact.findMany({
      where: { id: { in: contactIds } },
      select: { id: true, specialty: true },
    })

    // Map outgoing specialty data
    const outgoingSpecialtyMap = new Map<string, number>()
    outgoingBySpecialty.forEach((r) => {
      if (r.toContactId) {
        const contact = contacts.find((c) => c.id === r.toContactId)
        if (contact) {
          const current = outgoingSpecialtyMap.get(contact.specialty) || 0
          outgoingSpecialtyMap.set(contact.specialty, current + r._count)
        }
      }
    })

    const outgoingReferralsBySpecialtyData = Array.from(outgoingSpecialtyMap.entries())
      .map(([specialty, count]) => ({
        specialty,
        count,
        percentage: totalOutgoing > 0 ? Math.round((count / totalOutgoing) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Referrals by specialty (Incoming - from Magic Links etc)
    // @ts-ignore - Prisma client update might lag in editor
    const specialtyRange = (() => {
      if (specialtyPeriod === 'weekly') {
        const start = new Date(now)
        start.setDate(now.getDate() - 7)
        return { start, end: now }
      }
      if (specialtyPeriod === 'yearly') {
        return { start: new Date(currentYear, 0, 1), end: new Date(currentYear + 1, 0, 1) }
      }
      // monthly (default)
      return { start: new Date(currentYear, currentMonth, 1), end: new Date(currentYear, currentMonth + 1, 1) }
    })()

    const incomingBySpecialty = await prisma.referral.groupBy({
      by: ['specialty'],
      where: {
        OR: [
          { fromClinicId: clinicId, referralType: 'INCOMING' },
          { toClinicId: clinicId }
        ],
        specialty: { not: null }, // Only count those with specialty set
        createdAt: {
          gte: specialtyRange.start,
          lt: specialtyRange.end,
        },
      },
      _count: true,
    })

    const totalIncomingForSpecialty = incomingBySpecialty.reduce((sum: number, item: any) => sum + item._count, 0)

    const incomingReferralsBySpecialtyData = incomingBySpecialty
      .map((r: any) => ({
        specialty: r.specialty as string,
        count: r._count,
        percentage: totalIncomingForSpecialty > 0 ? Math.round((r._count / totalIncomingForSpecialty) * 100) : 0,
      }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)

    // Referral trends (last 12 months) - split by incoming/outgoing
    const referralTrends: Array<{ month: string; outgoing: number; incoming: number }> = []

    if (trendsPeriod === 'yearly') {
      for (let i = 4; i >= 0; i--) {
        const year = currentYear - i
        const date = new Date(year, 0, 1)
        const nextDate = new Date(year + 1, 0, 1)

        const outgoingCount = await prisma.referral.count({
          where: {
            fromClinicId: clinicId,
            referralType: 'OUTGOING',
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        })

        const incomingCount = await prisma.referral.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
            OR: [
              { fromClinicId: clinicId, referralType: 'INCOMING' },
              { toClinicId: clinicId },
            ],
          },
        })

        referralTrends.push({
          month: `${year}`,
          outgoing: outgoingCount,
          incoming: incomingCount,
        })
      }
    } else if (trendsPeriod === 'weekly') {
      const startOfWeek = (date: Date) => {
        const d = new Date(date)
        const day = d.getDay()
        const diff = (day === 0 ? -6 : 1) - day // Monday as first day of week
        d.setDate(d.getDate() + diff)
        d.setHours(0, 0, 0, 0)
        return d
      }

      for (let i = 11; i >= 0; i--) {
        const offset = new Date(now)
        offset.setDate(now.getDate() - i * 7)
        const date = startOfWeek(offset)
        const nextDate = new Date(date)
        nextDate.setDate(date.getDate() + 7)

        const outgoingCount = await prisma.referral.count({
          where: {
            fromClinicId: clinicId,
            referralType: 'OUTGOING',
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        })

        const incomingCount = await prisma.referral.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
            OR: [
              { fromClinicId: clinicId, referralType: 'INCOMING' },
              { toClinicId: clinicId },
            ],
          },
        })

        referralTrends.push({
          month: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          outgoing: outgoingCount,
          incoming: incomingCount,
        })
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1)
        const nextDate = new Date(currentYear, currentMonth - i + 1, 1)

        const outgoingCount = await prisma.referral.count({
          where: {
            fromClinicId: clinicId,
            referralType: 'OUTGOING',
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        })

        const incomingCount = await prisma.referral.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
            OR: [
              { fromClinicId: clinicId, referralType: 'INCOMING' },
              { toClinicId: clinicId },
            ],
          },
        })

        referralTrends.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          outgoing: outgoingCount,
          incoming: incomingCount,
        })
      }
    }

    // Get recent incoming referrals (last 5) - only pending (SUBMITTED or SENT status)
    const recentIncoming = await prisma.referral.findMany({
      where: {
        status: { in: pendingStatuses },
        OR: [
          { fromClinicId: clinicId, referralType: 'INCOMING' },
          { toClinicId: clinicId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        contact: true,
        clinic: true, // Show sender info
      },
    })

    // Get recent outgoing referrals (last 5)
    const recentOutgoing = await prisma.referral.findMany({
      where: {
        fromClinicId: clinicId,
        referralType: 'OUTGOING',
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        contact: true,
      },
    })

    // Overview metrics (computed from current month incoming data)
    const formatDuration = (ms: number): string => {
      const totalMinutes = Math.round(ms / (1000 * 60))
      if (totalMinutes <= 0) return '0m'
      const days = Math.floor(totalMinutes / (60 * 24))
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
      const minutes = totalMinutes % 60
      if (days > 0) {
        return `${days}d ${hours}h`
      }
      if (hours > 0) {
        return `${hours}h ${minutes}m`
      }
      return `${minutes}m`
    }

    const computeAverageDuration = async (status: 'ACCEPTED' | 'SENT' | 'COMPLETED') => {
      const rows = await prisma.referral.findMany({
        where: {
          status,
          OR: [
            { fromClinicId: clinicId, referralType: 'INCOMING' },
            { toClinicId: clinicId }
          ],
          createdAt: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
        select: { createdAt: true, updatedAt: true },
      })
      if (rows.length === 0) return '-'
      const totalMs = rows.reduce((sum, row) => sum + (row.updatedAt.getTime() - row.createdAt.getTime()), 0)
      return formatDuration(totalMs / rows.length)
    }

    const overviewMetrics = {
      dailyAverage: parseFloat((totalIncomingThisMonth / daysElapsedInMonth).toFixed(2)),
      avgSchedule: await computeAverageDuration('ACCEPTED'),
      avgAppointment: await computeAverageDuration('SENT'),
      avgTimeToTreatment: await computeAverageDuration('COMPLETED'),
    }

    // Referral process flow (this month, incoming)
    const scheduledThisMonth = await prisma.referral.count({
      where: {
        status: 'ACCEPTED',
        OR: [
          { fromClinicId: clinicId, referralType: 'INCOMING' },
          { toClinicId: clinicId }
        ],
        createdAt: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
    })

    const referralProcessFlow = totalIncomingThisMonth > 0 ? [
      {
        label: 'Referred',
        count: totalIncomingThisMonth,
        percentage: 100,
      },
      {
        label: 'Scheduled',
        count: scheduledThisMonth,
        percentage: Math.round((scheduledThisMonth / totalIncomingThisMonth) * 100),
      },
      {
        label: 'Completed',
        count: completedThisMonth,
        percentage: Math.round((completedThisMonth / totalIncomingThisMonth) * 100),
      },
    ] : []

    res.json({
      success: true,
      data: {
        totalReferrals,
        totalOutgoing,
        totalIncoming,
        outgoingChange,
        incomingChange,
        completedChange,
        pendingIncoming,
        pendingOutgoing,
        completedThisMonth,
        referralsBySpecialty: outgoingReferralsBySpecialtyData, // Keep backward compat
        outgoingReferralsBySpecialty: outgoingReferralsBySpecialtyData,
        incomingReferralsBySpecialty: incomingReferralsBySpecialtyData,
        referralTrends,
        referralProcessFlow,
        overviewMetrics,
        recentIncoming,
        recentOutgoing,
      },
    })
  } catch (error) {
    next(error)
  }
}

