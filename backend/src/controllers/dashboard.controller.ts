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

    // Pending incoming (need your action to accept/reject)
    const pendingIncoming = await prisma.referral.count({
      where: {
        status: 'SENT', // Waiting for your action
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
        fromClinicId: clinicId,
        status: 'COMPLETED',
        updatedAt: {
          gte: new Date(currentYear, currentMonth, 1),
          lt: new Date(currentYear, currentMonth + 1, 1),
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
        fromClinicId: clinicId,
        referralType: 'INCOMING',
        createdAt: {
          gte: new Date(previousMonthYear, previousMonth, 1),
          lt: new Date(previousMonthYear, previousMonth + 1, 1),
        },
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
    const incomingBySpecialty = await prisma.referral.groupBy({
      by: ['specialty'],
      where: {
        OR: [
          { fromClinicId: clinicId, referralType: 'INCOMING' },
          { toClinicId: clinicId }
        ],
        specialty: { not: null }, // Only count those with specialty set
      },
      _count: true,
    })

    const incomingReferralsBySpecialtyData = incomingBySpecialty
      .map((r: any) => ({
        specialty: r.specialty as string,
        count: r._count,
        percentage: totalIncoming > 0 ? Math.round((r._count / totalIncoming) * 100) : 0,
      }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)

    // Referral trends (last 12 months) - split by incoming/outgoing
    const referralTrends = []
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
          fromClinicId: clinicId,
          referralType: 'INCOMING',
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      })

      referralTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        outgoing: outgoingCount,
        incoming: incomingCount,
      })
    }

    // Get recent incoming referrals (last 5)
    const recentIncoming = await prisma.referral.findMany({
      where: {
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
        recentIncoming,
        recentOutgoing,
      },
    })
  } catch (error) {
    next(error)
  }
}

