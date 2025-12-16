import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { errors } from '../utils/errors'
import { generateReferralToken, generateAccessCode, hashAccessCode } from '../utils/tokens'

/**
 * Create a new magic referral link
 * POST /api/magic-referral-links
 */
export async function createReferralLink(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId
    if (!userId) {
      throw errors.unauthorized('Authentication required')
    }

    const { label, accessCode: providedAccessCode } = req.body

    // Generate token and access code
    const token = generateReferralToken()
    const accessCode = providedAccessCode || generateAccessCode(6)
    const accessCodeHash = await hashAccessCode(accessCode)

    // Create referral link
    const referralLink = await prisma.referralLink.create({
      data: {
        specialistId: userId,
        token,
        accessCodeHash,
        label: label || null,
        isActive: true,
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

    // Construct referral URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const referralUrl = `${frontendUrl}/refer-magic/${token}`

    res.status(201).json({
      success: true,
      data: {
        referralLink: {
          id: referralLink.id,
          token: referralLink.token,
          isActive: referralLink.isActive,
          label: referralLink.label,
          createdAt: referralLink.createdAt,
          updatedAt: referralLink.updatedAt,
          specialist: referralLink.specialist,
        },
        accessCode, // Return plaintext code ONLY ONCE (when created)
        referralUrl,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * List all referral links for the authenticated specialist
 * GET /api/magic-referral-links
 */
export async function listReferralLinks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId
    if (!userId) {
      throw errors.unauthorized('Authentication required')
    }

    const referralLinks = await prisma.referralLink.findMany({
      where: {
        specialistId: userId,
      },
      include: {
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

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

    res.json({
      success: true,
      data: referralLinks.map((link) => ({
        id: link.id,
        token: link.token,
        isActive: link.isActive,
        label: link.label,
        referralUrl: `${frontendUrl}/refer-magic/${link.token}`,
        referralCount: link._count.referrals,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
        // Note: accessCodeHash is NEVER returned
      })),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get a single referral link by ID
 * GET /api/magic-referral-links/:id
 */
export async function getReferralLink(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId
    if (!userId) {
      throw errors.unauthorized('Authentication required')
    }

    const { id } = req.params

    const referralLink = await prisma.referralLink.findFirst({
      where: {
        id,
        specialistId: userId, // Ensure user owns this link
      },
      include: {
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

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

    res.json({
      success: true,
      data: {
        id: referralLink.id,
        token: referralLink.token,
        isActive: referralLink.isActive,
        label: referralLink.label,
        referralUrl: `${frontendUrl}/refer-magic/${referralLink.token}`,
        referralCount: referralLink._count.referrals,
        createdAt: referralLink.createdAt,
        updatedAt: referralLink.updatedAt,
        // Note: accessCodeHash is NEVER returned
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update a referral link
 * PUT /api/magic-referral-links/:id
 */
export async function updateReferralLink(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId
    if (!userId) {
      throw errors.unauthorized('Authentication required')
    }

    const { id } = req.params
    const { isActive, label, regenerateAccessCode } = req.body

    // Check if link exists and belongs to user
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
    let newAccessCode: string | undefined

    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    if (label !== undefined) {
      updateData.label = label || null
    }

    // Regenerate access code if requested
    if (regenerateAccessCode === true) {
      newAccessCode = generateAccessCode(6)
      updateData.accessCodeHash = await hashAccessCode(newAccessCode)
    }

    // Update link
    const updatedLink = await prisma.referralLink.update({
      where: { id },
      data: updateData,
    })

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

    const response: any = {
      success: true,
      data: {
        id: updatedLink.id,
        token: updatedLink.token,
        isActive: updatedLink.isActive,
        label: updatedLink.label,
        referralUrl: `${frontendUrl}/refer-magic/${updatedLink.token}`,
        createdAt: updatedLink.createdAt,
        updatedAt: updatedLink.updatedAt,
      },
    }

    // Return new access code if regenerated (ONLY ONCE)
    if (newAccessCode) {
      response.data.accessCode = newAccessCode
    }

    res.json(response)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a referral link
 * DELETE /api/magic-referral-links/:id
 */
export async function deleteReferralLink(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId
    if (!userId) {
      throw errors.unauthorized('Authentication required')
    }

    const { id } = req.params

    // Check if link exists and belongs to user
    const existingLink = await prisma.referralLink.findFirst({
      where: {
        id,
        specialistId: userId,
      },
    })

    if (!existingLink) {
      throw errors.notFound('Referral link not found')
    }

    // Delete link (cascade will handle referrals' referralLinkId -> null)
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
