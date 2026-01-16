import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { errors } from '../utils/errors'

/**
 * Get all contacts for the clinic
 */
export async function getAllContacts(req: Request, res: Response, next: NextFunction) {
  try {
    // Get clinic ID from authenticated user
    const clinicId = req.user?.clinicId

    if (!clinicId) {
      throw new Error('User does not belong to a clinic')
    }
    const { page = 1, limit = 10, search, specialty, status } = req.query

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    // Build where clause
    const where: any = { clinicId }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } },
      ]
    }

    if (specialty) {
      where.specialty = specialty
    }

    if (status) {
      where.status = status
    }

    // Get contacts with pagination
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.count({ where }),
    ])

    res.json({
      success: true,
      data: contacts,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get contact by ID
 */
export async function getContactById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    // Get clinic ID from authenticated user
    const clinicId = req.user?.clinicId

    if (!clinicId) {
      throw errors.badRequest('User does not belong to a clinic')
    }

    const contact = await prisma.contact.findFirst({
      where: { id, clinicId },
    })

    if (!contact) {
      throw errors.notFound('Contact not found')
    }

    res.json({
      success: true,
      data: contact,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create new contact
 */
export async function createContact(req: Request, res: Response, next: NextFunction) {
  try {
    // Get clinic ID from authenticated user
    const clinicId = req.user?.clinicId

    if (!clinicId) {
      throw new Error('User does not belong to a clinic')
    }
    const { name, specialty, phone, email, address, notes } = req.body

    const contact = await prisma.contact.create({
      data: {
        clinicId,
        name,
        specialty,
        phone,
        email,
        address,
        notes,
        status: 'ACTIVE',
      },
    })

    res.status(201).json({
      success: true,
      data: contact,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update contact
 */
export async function updateContact(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    // For development: use first clinic if no auth
    let clinicId = req.user?.clinicId
    if (!clinicId) {
      const firstClinic = await prisma.clinic.findFirst()
      clinicId = firstClinic?.id
    }

    if (!clinicId) {
      throw errors.badRequest('No clinic found')
    }

    const { name, specialty, phone, email, address, notes, status } = req.body

    // Check if contact exists and belongs to clinic
    const existingContact = await prisma.contact.findFirst({
      where: { id, clinicId },
    })

    if (!existingContact) {
      throw errors.notFound('Contact not found')
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        name,
        specialty,
        phone,
        email,
        address,
        notes,
        status,
      },
    })

    res.json({
      success: true,
      data: contact,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete contact
 */
export async function deleteContact(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    // For development: use first clinic if no auth
    let clinicId = req.user?.clinicId
    if (!clinicId) {
      const firstClinic = await prisma.clinic.findFirst()
      clinicId = firstClinic?.id
    }

    if (!clinicId) {
      throw errors.badRequest('No clinic found')
    }

    // Check if contact exists and belongs to clinic
    const contact = await prisma.contact.findFirst({
      where: { id, clinicId },
    })

    if (!contact) {
      throw errors.notFound('Contact not found')
    }

    // Check if contact has referrals
    const referralCount = await prisma.referral.count({
      where: { toContactId: id },
    })

    if (referralCount > 0) {
      throw errors.badRequest('Cannot delete contact with existing referrals')
    }

    await prisma.contact.delete({
      where: { id },
    })

    res.json({
      success: true,
      message: 'Contact deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

