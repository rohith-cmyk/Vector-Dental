import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const clinicId = req.user!.clinicId

    // Get current date info
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Total referrals
    const totalReferrals = await prisma.referral.count({
      where: { clinicId },
    })

    // Pending referrals (sent + accepted)
    const pendingReferrals = await prisma.referral.count({
      where: {
        clinicId,
        status: { in: ['SENT', 'ACCEPTED'] },
      },
    })

    // Completed this month
    const completedThisMonth = await prisma.referral.count({
      where: {
        clinicId,
        status: 'COMPLETED',
        updatedAt: {
          gte: new Date(currentYear, currentMonth, 1),
          lt: new Date(currentYear, currentMonth + 1, 1),
        },
      },
    })

    // Referrals by specialty
    const referralsBySpecialty = await prisma.referral.groupBy({
      by: ['contactId'],
      where: { clinicId },
      _count: true,
    })

    // Get contact details for specialties
    const contactIds = referralsBySpecialty.map((r) => r.contactId)
    const contacts = await prisma.contact.findMany({
      where: { id: { in: contactIds } },
      select: { id: true, specialty: true },
    })

    // Map specialty data
    const specialtyMap = new Map<string, number>()
    referralsBySpecialty.forEach((r) => {
      const contact = contacts.find((c) => c.id === r.contactId)
      if (contact) {
        const current = specialtyMap.get(contact.specialty) || 0
        specialtyMap.set(contact.specialty, current + r._count)
      }
    })

    const referralsBySpecialtyData = Array.from(specialtyMap.entries())
      .map(([specialty, count]) => ({
        specialty,
        count,
        percentage: totalReferrals > 0 ? Math.round((count / totalReferrals) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 specialties

    // Referral trends (last 12 months)
    const referralTrends = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const nextDate = new Date(currentYear, currentMonth - i + 1, 1)

      const count = await prisma.referral.count({
        where: {
          clinicId,
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      })

      referralTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        count,
      })
    }

    res.json({
      success: true,
      data: {
        totalReferrals,
        pendingReferrals,
        completedThisMonth,
        referralsBySpecialty: referralsBySpecialtyData,
        referralTrends,
      },
    })
  } catch (error) {
    next(error)
  }
}

