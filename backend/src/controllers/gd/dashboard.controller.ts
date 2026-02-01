import { Request, Response } from 'express'
import { prisma } from '../../config/database'
import { errors } from '../../utils/errors'

/**
 * Get GD Dashboard Stats
 * Returns statistics for the GD dashboard
 */
export async function getDashboardStats(req: Request, res: Response) {
    try {
        const clinicId = req.user!.clinicId

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
                where: { fromClinicId: clinicId }
            }),
            // Pending (SUBMITTED status)
            prisma.referral.count({
                where: {
                    fromClinicId: clinicId,
                    status: 'SUBMITTED'
                }
            }),
            // Accepted
            prisma.referral.count({
                where: {
                    fromClinicId: clinicId,
                    status: 'ACCEPTED'
                }
            }),
            // Completed
            prisma.referral.count({
                where: {
                    fromClinicId: clinicId,
                    status: 'COMPLETED'
                }
            }),
            // Rejected
            prisma.referral.count({
                where: {
                    fromClinicId: clinicId,
                    status: 'REJECTED'
                }
            }),
        ])

        // Get recent referrals
        const recentReferrals = await prisma.referral.findMany({
            where: { fromClinicId: clinicId },
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
