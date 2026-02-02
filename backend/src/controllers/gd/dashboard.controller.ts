import { Request, Response } from 'express'
import { prisma } from '../../config/database'
import { errors } from '../../utils/errors'

/**
 * Get GD Dashboard Stats
 * Returns statistics for the GD dashboard
 */
export async function getDashboardStats(req: Request, res: Response) {
    try {
        const gdUser = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            include: { clinic: true },
        })

        const clinicId = gdUser?.clinicId || req.user?.clinicId
        const clinicEmail = gdUser?.clinic?.email || undefined
        const clinicName = gdUser?.clinic?.name || undefined
        const tokenEmail = req.user?.email

        if (!clinicId && !tokenEmail && !clinicEmail && !clinicName) {
            throw errors.notFound('Clinic not found for user')
        }

        const whereOr: any[] = []
        if (clinicId) whereOr.push({ fromClinicId: clinicId })
        if (clinicEmail) whereOr.push({ fromClinicEmail: clinicEmail })
        if (clinicName) whereOr.push({ fromClinicName: clinicName })
        if (tokenEmail) whereOr.push({ fromClinicEmail: tokenEmail })

        const baseWhere: any = whereOr.length ? { OR: whereOr } : {}

        // Get referral counts
        const [
            totalReferrals,
            pendingReferrals,
            acceptedReferrals,
            completedReferrals,
            rejectedReferrals,
        ] = await Promise.all([
            // Total referrals created by this GD
            prisma.referral.count({
                where: baseWhere
            }),
            // Pending (SUBMITTED status)
            prisma.referral.count({
                where: {
                    ...baseWhere,
                    status: 'SUBMITTED'
                }
            }),
            // Accepted
            prisma.referral.count({
                where: {
                    ...baseWhere,
                    status: 'ACCEPTED'
                }
            }),
            // Completed
            prisma.referral.count({
                where: {
                    ...baseWhere,
                    status: 'COMPLETED'
                }
            }),
            // Rejected
            prisma.referral.count({
                where: {
                    ...baseWhere,
                    status: 'REJECTED'
                }
            }),
        ])

        // Get recent referrals
        const recentReferrals = await prisma.referral.findMany({
            where: baseWhere,
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                intendedRecipient: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        clinic: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                files: true,
            }
        })

        res.json({
            success: true,
            data: {
                stats: {
                    total: totalReferrals,
                    pending: pendingReferrals,
                    accepted: acceptedReferrals,
                    completed: completedReferrals,
                    rejected: rejectedReferrals,
                },
                recentReferrals,
            }
        })
    } catch (error: any) {
        console.error('Get GD dashboard stats error:', error)
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to fetch dashboard stats'
        })
    }
}
