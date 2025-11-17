import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { errors } from '../utils/errors'

/**
 * Get referral link for clinic
 */
export async function getReferralLink(req: Request, res: Response, next: NextFunction) {
  try {
    // For development: use demo user's clinic if no auth
    let clinicId = req.user?.clinicId
    
    if (!clinicId) {
      const demoUser = await prisma.user.findUnique({
        where: { email: 'admin@dental.com' },
      })
      
      if (demoUser) {
        clinicId = demoUser.clinicId
      } else {
        const firstClinic = await prisma.clinic.findFirst()
        if (!firstClinic) {
          throw errors.notFound('No clinic found')
        }
        clinicId = firstClinic.id
      }
    }

    // Get or create referral link
    let referralLink = await prisma.clinicReferralLink.findUnique({
      where: { clinicId },
      include: {
        clinic: true,
      },
    })

    if (!referralLink) {
      // Generate slug from clinic name
      const clinic = await prisma.clinic.findUnique({
        where: { id: clinicId },
      })

      if (!clinic) {
        throw errors.notFound('Clinic not found')
      }

      const slug = clinic.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      referralLink = await prisma.clinicReferralLink.create({
        data: {
          clinicId,
          slug,
          isActive: true,
        },
        include: {
          clinic: true,
        },
      })
    }

    res.json({
      success: true,
      data: {
        slug: referralLink.slug,
        isActive: referralLink.isActive,
        clinicName: referralLink.clinic.name,
        referralUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/refer/${referralLink.slug}`,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update referral link (toggle active/inactive, update slug)
 */
export async function updateReferralLink(req: Request, res: Response, next: NextFunction) {
  try {
    let clinicId = req.user?.clinicId
    
    if (!clinicId) {
      const demoUser = await prisma.user.findUnique({
        where: { email: 'admin@dental.com' },
      })
      
      if (demoUser) {
        clinicId = demoUser.clinicId
      } else {
        throw errors.unauthorized('Authentication required')
      }
    }

    const { isActive, slug } = req.body

    // Check if referral link exists
    const existingLink = await prisma.clinicReferralLink.findUnique({
      where: { clinicId },
    })

    if (!existingLink) {
      throw errors.notFound('Referral link not found')
    }

    // Validate slug if provided
    if (slug) {
      // Check if slug is already taken by another clinic
      const slugExists = await prisma.clinicReferralLink.findFirst({
        where: {
          slug,
          clinicId: { not: clinicId },
        },
      })

      if (slugExists) {
        throw errors.conflict('This slug is already taken by another clinic')
      }

      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(slug)) {
        throw errors.badRequest('Slug can only contain lowercase letters, numbers, and hyphens')
      }
    }

    // Update referral link
    const updatedLink = await prisma.clinicReferralLink.update({
      where: { clinicId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(slug && { slug }),
      },
      include: {
        clinic: true,
      },
    })

    res.json({
      success: true,
      data: {
        slug: updatedLink.slug,
        isActive: updatedLink.isActive,
        clinicName: updatedLink.clinic.name,
        referralUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/refer/${updatedLink.slug}`,
      },
    })
  } catch (error) {
    next(error)
  }
}

