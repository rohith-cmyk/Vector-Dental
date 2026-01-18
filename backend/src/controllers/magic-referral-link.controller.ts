import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { errors } from '../utils/errors'
import {
  generateReferralToken,
} from '../utils/tokens'
import { config } from '../config/env'

/**
 * Create a new referral link
 * POST /api/referral-links
 */
export async function createReferralLink(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId
    const { label, specialty } = req.body

    // Access codes are no longer required - set to empty string (schema requires non-null)
    // TODO: Update schema to make accessCodeHash nullable in future migration
    const accessCodeHash = ''

    // Generate unique token
    let token: string = ''
    let tokenExists = true
    let attempts = 0
    const maxAttempts = 10

    // Ensure token is unique (very unlikely to collide, but safety check)
    while (tokenExists && attempts < maxAttempts) {
      token = generateReferralToken()
      const existing = await prisma.referralLink.findUnique({
        where: { token },
      })
      tokenExists = !!existing
      attempts++
    }

    if (tokenExists) {
      throw errors.internal('Failed to generate unique token')
    }

    // Create referral link
    const referralLink = await prisma.referralLink.create({
      data: {
        specialistId: userId,
        token: token!,
        accessCodeHash,
        isActive: true,
        label: label || null,
        specialty: specialty || null,
      },
      include: {
        specialist: {
          select: {
            id: true,
            name: true,
            email: true,
            clinic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Build referral URL
    const frontendUrl = process.env.FRONTEND_URL || config.corsOrigin
    const referralUrl = `${frontendUrl}/refer-magic/${token}`

    res.status(201).json({
      success: true,
      data: {
        referralLink: {
          id: referralLink.id,
          token: referralLink.token,
          isActive: referralLink.isActive,
          label: referralLink.label,
          specialty: referralLink.specialty,
          createdAt: referralLink.createdAt,
          updatedAt: referralLink.updatedAt,
          specialist: referralLink.specialist,
        },
        referralUrl,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get all referral links for the logged-in specialist
 * GET /api/referral-links
 */
export async function listReferralLinks(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId

    const referralLinks = await prisma.referralLink.findMany({
      where: {
        specialistId: userId,
      },
      include: {
        specialist: {
          select: {
            id: true,
            name: true,
            email: true,
            clinic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            referrals: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Build referral URLs
    const frontendUrl = process.env.FRONTEND_URL || config.corsOrigin
    const linksWithUrls = referralLinks.map((link) => ({
      id: link.id,
      token: link.token,
      isActive: link.isActive,
      label: link.label,
      specialty: link.specialty,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
      referralUrl: `${frontendUrl}/refer-magic/${link.token}`,
      referralCount: link._count.referrals,
      // DO NOT include accessCodeHash or plaintext access code
    }))

    res.json({
      success: true,
      data: linksWithUrls,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get a specific referral link by ID
 * GET /api/referral-links/:id
 */
export async function getReferralLink(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId
    const { id } = req.params

    const referralLink = await prisma.referralLink.findFirst({
      where: {
        id,
        specialistId: userId, // Ensure user owns this link
      },
      include: {
        specialist: {
          select: {
            id: true,
            name: true,
            email: true,
            clinic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            referrals: true,
          },
        },
      },
    })

    if (!referralLink) {
      throw errors.notFound('Referral link not found')
    }

    const frontendUrl = process.env.FRONTEND_URL || config.corsOrigin

    res.json({
      success: true,
      data: {
        id: referralLink.id,
        token: referralLink.token,
        isActive: referralLink.isActive,
        label: referralLink.label,
        specialty: referralLink.specialty,
        createdAt: referralLink.createdAt,
        updatedAt: referralLink.updatedAt,
        referralUrl: `${frontendUrl}/refer-magic/${referralLink.token}`,
        referralCount: referralLink._count.referrals,
        // DO NOT include accessCodeHash
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update a referral link (toggle active/inactive, update label, regenerate access code)
 * PUT /api/referral-links/:id
 */
export async function updateReferralLink(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId
    const { id } = req.params
    const { isActive, label } = req.body

    // Verify ownership
    const existingLink = await prisma.referralLink.findFirst({
      where: {
        id,
        specialistId: userId,
      },
    })

    if (!existingLink) {
      throw errors.notFound('Referral link not found')
    }

    // Prepare update data
    const updateData: any = {}

    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    if (label !== undefined) {
      updateData.label = label || null
    }

    const updatedLink = await prisma.referralLink.update({
      where: { id },
      data: updateData,
      include: {
        specialist: {
          select: {
            id: true,
            name: true,
            email: true,
            clinic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    const frontendUrl = process.env.FRONTEND_URL || config.corsOrigin

    res.json({
      success: true,
      data: {
        id: updatedLink.id,
        token: updatedLink.token,
        isActive: updatedLink.isActive,
        label: updatedLink.label,
        createdAt: updatedLink.createdAt,
        updatedAt: updatedLink.updatedAt,
        referralUrl: `${frontendUrl}/refer-magic/${updatedLink.token}`,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a referral link
 * DELETE /api/referral-links/:id
 */
export async function deleteReferralLink(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId
    const { id } = req.params

    // Verify ownership
    const existingLink = await prisma.referralLink.findFirst({
      where: {
        id,
        specialistId: userId,
      },
    })

    if (!existingLink) {
      throw errors.notFound('Referral link not found')
    }

    // Delete the link (cascades will handle referrals - referralLinkId becomes null)
    await prisma.referralLink.delete({
      where: { id },
    })

    res.json({
      success: true,
      message: 'Referral link deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
