import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'

/**
 * Get dashboard statistics for two-way referral system
 */
export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    // For development: use demo user's clinic if no auth
    let clinicId = req.user?.clinicId
    
    if (!clinicId) {
      // Try to get clinic from demo user (admin@dental.com)
      const demoUser = await prisma.user.findUnique({
        where: { email: 'admin@dental.com' },
        include: { clinic: true },
      })
      
      if (demoUser && demoUser.clinic) {
        clinicId = demoUser.clinicId
        console.log(`📊 Using demo user's clinic: ${demoUser.clinic.name} (ID: ${clinicId})`)
      } else {
        // Fallback: Get first clinic from database
        const firstClinic = await prisma.clinic.findFirst()
        if (!firstClinic) {
          // No clinics in database - return empty stats
          return res.json({
            success: true,
            data: {
              totalReferrals: 0,
              totalOutgoing: 0,
              totalIncoming: 0,
              pendingIncoming: 0,
              pendingOutgoing: 0,
              completedThisMonth: 0,
              referralsBySpecialty: [],
              referralTrends: Array.from({ length: 12 }, (_, i) => {
                const date = new Date()
                date.setMonth(date.getMonth() - (11 - i))
                return {
                  month: date.toLocaleDateString('en-US', { month: 'short' }),
                  outgoing: 0,
                  incoming: 0,
                }
              }),
              recentIncoming: [],
              recentOutgoing: [],
            },
          })
        }
        clinicId = firstClinic.id
        console.log(`📊 Using first clinic: ${firstClinic.name} (ID: ${clinicId})`)
      }
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
        fromClinicId: clinicId,
        referralType: 'INCOMING',
      },
    })

    // Pending incoming (need your action to accept/reject)
    const pendingIncoming = await prisma.referral.count({
      where: {
        fromClinicId: clinicId,
        referralType: 'INCOMING',
        status: 'SENT', // Waiting for your action
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
        fromClinicId: clinicId,
        referralType: 'INCOMING',
        createdAt: {
          gte: new Date(currentYear, currentMonth, 1),
          lt: new Date(currentYear, currentMonth + 1, 1),
        },
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

    // Referrals by specialty (only for outgoing referrals)
    const referralsBySpecialty = await prisma.referral.groupBy({
      by: ['toContactId'],
      where: { 
        fromClinicId: clinicId,
        referralType: 'OUTGOING',
        toContactId: { not: null },
      },
      _count: true,
    })

    // Get contact details for specialties
    const contactIds = referralsBySpecialty
      .map((r) => r.toContactId)
      .filter((id): id is string => id !== null)
      
    const contacts = await prisma.contact.findMany({
      where: { id: { in: contactIds } },
      select: { id: true, specialty: true },
    })

    // Map specialty data
    const specialtyMap = new Map<string, number>()
    referralsBySpecialty.forEach((r) => {
      if (r.toContactId) {
        const contact = contacts.find((c) => c.id === r.toContactId)
        if (contact) {
          const current = specialtyMap.get(contact.specialty) || 0
          specialtyMap.set(contact.specialty, current + r._count)
        }
      }
    })

    const referralsBySpecialtyData = Array.from(specialtyMap.entries())
      .map(([specialty, count]) => ({
        specialty,
        count,
        percentage: totalOutgoing > 0 ? Math.round((count / totalOutgoing) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 specialties

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
        fromClinicId: clinicId,
        referralType: 'INCOMING',
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        contact: true,
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
        referralsBySpecialty: referralsBySpecialtyData,
        referralTrends,
        recentIncoming,
        recentOutgoing,
      },
    })
  } catch (error) {
    next(error)
  }
}

