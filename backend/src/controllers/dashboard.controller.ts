import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { errors } from '../utils/errors'

/**
 * Get dashboard statistics for two-way referral system
 */
export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    // Get clinic ID from authenticated user
    const clinicId = req.user?.clinicId

    if (!clinicId) {
      // This should be caught by auth middleware, but double check
      throw errors.unauthorized('User does not belong to a clinic')
    }

    // Get current date info
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
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

    const pendingStatuses: Array<'SUBMITTED' | 'SENT'> = ['SUBMITTED', 'SENT']
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
    const [
      totalReferrals,
      totalOutgoing,
      totalIncoming,
      pendingIncoming,
      pendingOutgoing,
      completedThisMonth,
      previousOutgoing,
      currentMonthOutgoing,
      previousIncoming,
      currentMonthIncoming,
      previousCompleted,
      totalIncomingThisMonth,
      scheduledThisMonth,
      outgoingBySpecialty,
      incomingBySpecialty,
      incomingForOffice,
      recentIncoming,
      recentOutgoing,
    ] = await Promise.all([
      prisma.referral.count({ where: { fromClinicId: clinicId } }),
      prisma.referral.count({
        where: { fromClinicId: clinicId, referralType: 'OUTGOING' },
      }),
      prisma.referral.count({
        where: {
          OR: [
            { fromClinicId: clinicId, referralType: 'INCOMING' },
            { toClinicId: clinicId }
          ]
        },
      }),
      prisma.referral.count({
        where: {
          status: { in: pendingStatuses },
          OR: [
            { fromClinicId: clinicId, referralType: 'INCOMING' },
            { toClinicId: clinicId }
          ]
        },
      }),
      prisma.referral.count({
        where: {
          fromClinicId: clinicId,
          referralType: 'OUTGOING',
          status: { in: ['SENT', 'ACCEPTED'] },
        },
      }),
      prisma.referral.count({
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
      }),
      prisma.referral.count({
        where: {
          fromClinicId: clinicId,
          referralType: 'OUTGOING',
          createdAt: {
            gte: new Date(previousMonthYear, previousMonth, 1),
            lt: new Date(previousMonthYear, previousMonth + 1, 1),
          },
        },
      }),
      prisma.referral.count({
        where: {
          fromClinicId: clinicId,
          referralType: 'OUTGOING',
          createdAt: {
            gte: new Date(currentYear, currentMonth, 1),
            lt: new Date(currentYear, currentMonth + 1, 1),
          },
        },
      }),
      prisma.referral.count({
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
      }),
      prisma.referral.count({
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
      }),
      prisma.referral.count({
        where: {
          fromClinicId: clinicId,
          status: 'COMPLETED',
          updatedAt: {
            gte: new Date(previousMonthYear, previousMonth, 1),
            lt: new Date(previousMonthYear, previousMonth + 1, 1),
          },
        },
      }),
      prisma.referral.count({
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
      }),
      prisma.referral.count({
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
      }),
      prisma.referral.groupBy({
        by: ['toContactId'],
        where: {
          fromClinicId: clinicId,
          referralType: 'OUTGOING',
          toContactId: { not: null },
        },
        _count: true,
      }),
      prisma.referral.groupBy({
        by: ['specialty'],
        where: {
          OR: [
            { fromClinicId: clinicId, referralType: 'INCOMING' },
            { toClinicId: clinicId }
          ],
          specialty: { not: null },
          createdAt: {
            gte: specialtyRange.start,
            lt: specialtyRange.end,
          },
        },
        _count: true,
      }),
      prisma.referral.findMany({
        where: {
          OR: [
            { fromClinicId: clinicId, referralType: 'INCOMING' },
            { toClinicId: clinicId }
          ],
          createdAt: {
            gte: specialtyRange.start,
            lt: specialtyRange.end,
          },
        },
        select: {
          fromClinicName: true,
          gpClinicName: true,
        },
      }),
      prisma.referral.findMany({
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
          clinic: true,
        },
      }),
      prisma.referral.findMany({
        where: {
          fromClinicId: clinicId,
          referralType: 'OUTGOING',
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          contact: true,
        },
      }),
    ])

    // Calculate percentage changes (current month vs previous month)
    // Calculate percentage changes
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const outgoingChange = calculateChange(currentMonthOutgoing, previousOutgoing)
    const incomingChange = calculateChange(currentMonthIncoming, previousIncoming)
    const completedChange = calculateChange(completedThisMonth, previousCompleted)

    // Get contact details for outgoing specialties
    const contactIds = outgoingBySpecialty
      .map((r) => r.toContactId)
      .filter((id): id is string => id !== null)

    const contacts = contactIds.length > 0
      ? await prisma.contact.findMany({
          where: { id: { in: contactIds } },
          select: { id: true, specialty: true },
        })
      : []

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
    const totalIncomingForSpecialty = incomingBySpecialty.reduce((sum: number, item: any) => sum + item._count, 0)

    const incomingReferralsBySpecialtyData = incomingBySpecialty
      .map((r: any) => ({
        specialty: r.specialty as string,
        count: r._count,
        percentage: totalIncomingForSpecialty > 0 ? Math.round((r._count / totalIncomingForSpecialty) * 100) : 0,
      }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)

    const officeCounts = new Map<string, number>()
    incomingForOffice.forEach((referral) => {
      const name = referral.gpClinicName || referral.fromClinicName
      if (!name) return
      officeCounts.set(name, (officeCounts.get(name) || 0) + 1)
    })

    const totalIncomingForOffice = Array.from(officeCounts.values()).reduce((sum, count) => sum + count, 0)
    const referralsByOffice = Array.from(officeCounts.entries())
      .map(([office, count]) => ({
        office,
        count,
        percentage: totalIncomingForOffice > 0 ? Math.round((count / totalIncomingForOffice) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const buildReferralTrends = async () => {
      const countOutgoing = (start: Date, end: Date) => prisma.referral.count({
        where: {
          fromClinicId: clinicId,
          referralType: 'OUTGOING',
          createdAt: { gte: start, lt: end },
        },
      })
      const countIncoming = (start: Date, end: Date) => prisma.referral.count({
        where: {
          createdAt: { gte: start, lt: end },
          OR: [
            { fromClinicId: clinicId, referralType: 'INCOMING' },
            { toClinicId: clinicId },
          ],
        },
      })

      if (trendsPeriod === 'yearly') {
        const ranges = Array.from({ length: 5 }, (_, idx) => {
          const year = currentYear - (4 - idx)
          const start = new Date(year, 0, 1)
          const end = new Date(year + 1, 0, 1)
          return { label: `${year}`, start, end }
        })
        const rows = await Promise.all(ranges.map(async (range) => {
          const [outgoing, incoming] = await Promise.all([
            countOutgoing(range.start, range.end),
            countIncoming(range.start, range.end),
          ])
          return { month: range.label, outgoing, incoming }
        }))
        return rows
      }

      if (trendsPeriod === 'weekly') {
        const startOfWeek = (date: Date) => {
          const d = new Date(date)
          const day = d.getDay()
          const diff = (day === 0 ? -6 : 1) - day
          d.setDate(d.getDate() + diff)
          d.setHours(0, 0, 0, 0)
          return d
        }

        const ranges = Array.from({ length: 12 }, (_, idx) => {
          const offset = new Date(now)
          offset.setDate(now.getDate() - (11 - idx) * 7)
          const start = startOfWeek(offset)
          const end = new Date(start)
          end.setDate(start.getDate() + 7)
          return { label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), start, end }
        })
        const rows = await Promise.all(ranges.map(async (range) => {
          const [outgoing, incoming] = await Promise.all([
            countOutgoing(range.start, range.end),
            countIncoming(range.start, range.end),
          ])
          return { month: range.label, outgoing, incoming }
        }))
        return rows
      }

      const ranges = Array.from({ length: 12 }, (_, idx) => {
        const date = new Date(currentYear, currentMonth - (11 - idx), 1)
        const end = new Date(currentYear, currentMonth - (11 - idx) + 1, 1)
        return { label: date.toLocaleDateString('en-US', { month: 'short' }), start: date, end }
      })
      const rows = await Promise.all(ranges.map(async (range) => {
        const [outgoing, incoming] = await Promise.all([
          countOutgoing(range.start, range.end),
          countIncoming(range.start, range.end),
        ])
        return { month: range.label, outgoing, incoming }
      }))
      return rows
    }

    const referralTrends = await buildReferralTrends()

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

    const [avgSchedule, avgAppointment, avgTimeToTreatment] = await Promise.all([
      computeAverageDuration('ACCEPTED'),
      computeAverageDuration('SENT'),
      computeAverageDuration('COMPLETED'),
    ])

    const overviewMetrics = {
      dailyAverage: parseFloat((totalIncomingThisMonth / daysElapsedInMonth).toFixed(2)),
      avgSchedule,
      avgAppointment,
      avgTimeToTreatment,
    }

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
        referralsByOffice,
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

