import { Request, Response } from 'express'
import { prisma } from '../../config/database'
import { errors } from '../../utils/errors'

/**
 * Get specialist directory
 * Returns list of all specialists available for referrals
 */
export async function getSpecialistDirectory(req: Request, res: Response) {
    try {
        const { search, specialty, page = 1, limit = 20 } = req.query

        const skip = (Number(page) - 1) * Number(limit)
        const take = Number(limit)

        // Build where clause
        const where: any = {
            userType: 'SPECIALIST',
            role: { in: ['ADMIN', 'STAFF'] },
        }

        // Search by name or clinic name
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { clinic: { name: { contains: search as string, mode: 'insensitive' } } },
            ]
        }

        // TODO: Filter by specialty when specialty field is added to clinic model
        // if (specialty && specialty !== 'all') {
        //   where.clinic = {
        //     specialty: specialty
        //   }
        // }

        // Get specialists and total count
        const [specialists, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    clinic: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                            phone: true,
                            email: true,
                            logoUrl: true,
                        }
                    },
                    specialistProfile: {
                        select: {
                            firstName: true,
                            lastName: true,
                            credentials: true,
                            specialty: true,
                            subSpecialties: true,
                            yearsInPractice: true,
                            boardCertified: true,
                            languages: true,
                            insuranceAccepted: true,
                            phone: true,
                            email: true,
                            website: true,
                            address: true,
                            city: true,
                            state: true,
                            zip: true,
                        }
                    },
                    _count: {
                        select: {
                            intendedReferrals: true, // Count of referrals received
                        }
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            }),
            prisma.user.count({ where })
        ])

        // Format response
        const formattedSpecialists = specialists.map(specialist => ({
            id: specialist.id,
            name: specialist.name,
            email: specialist.email,
            clinic: specialist.clinic,
            specialistProfile: specialist.specialistProfile,
            referralCount: specialist._count.intendedReferrals,
            // TODO: Add rating when review system is implemented
            rating: 4.8,
            // TODO: Calculate distance based on location when implemented
            distance: null,
        }))

        res.json({
            success: true,
            data: {
                specialists: formattedSpecialists,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            }
        })
    } catch (error: any) {
        console.error('Get specialist directory error:', error)
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to fetch specialist directory'
        })
    }
}

/**
 * Get specialist profile
 * Returns detailed information about a specific specialist
 */
export async function getSpecialistProfile(req: Request, res: Response) {
    try {
        const { id } = req.params

        const specialist = await prisma.user.findFirst({
            where: {
                id,
                userType: 'SPECIALIST',
            },
            select: {
                id: true,
                name: true,
                email: true,
                clinic: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        phone: true,
                        email: true,
                        logoUrl: true,
                    }
                },
                specialistProfile: {
                    select: {
                        firstName: true,
                        lastName: true,
                        credentials: true,
                        specialty: true,
                        subSpecialties: true,
                        yearsInPractice: true,
                        boardCertified: true,
                        languages: true,
                        insuranceAccepted: true,
                        phone: true,
                        email: true,
                        website: true,
                        address: true,
                        city: true,
                        state: true,
                        zip: true,
                    }
                },
                _count: {
                    select: {
                        intendedReferrals: true,
                    }
                }
            }
        })

        if (!specialist) {
            throw errors.notFound('Specialist not found')
        }

        res.json({
            success: true,
            data: {
                ...specialist,
                referralCount: specialist._count.intendedReferrals,
                rating: 4.8, // TODO: Calculate from reviews
            }
        })
    } catch (error: any) {
        console.error('Get specialist profile error:', error)
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to fetch specialist profile'
        })
    }
}
