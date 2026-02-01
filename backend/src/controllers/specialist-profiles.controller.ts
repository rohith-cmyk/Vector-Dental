import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { errors } from '../utils/errors'
import { deleteFile, uploadSpecialistPhoto } from '../utils/storage'

type SpecialistRole = 'ADMIN' | 'STAFF'

const ROLE_LABELS: Record<SpecialistRole, 'Admin' | 'Staff'> = {
  ADMIN: 'Admin',
  STAFF: 'Staff',
}

const normalizeList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

const parseYearsInPractice = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value)
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return Math.trunc(parsed)
    }
  }
  return null
}

const splitName = (fullName: string): { firstName: string | null; lastName: string | null } => {
  const trimmed = fullName.trim()
  if (!trimmed) {
    return { firstName: null, lastName: null }
  }
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null }
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

const parseRole = (role?: string): SpecialistRole => {
  const normalized = (role || '').trim().toUpperCase()
  if (normalized === 'ADMIN' || normalized === 'STAFF') {
    return normalized
  }
  if (normalized === 'ADMINISTRATOR') {
    return 'ADMIN'
  }
  throw errors.badRequest('Invalid role. Use Admin or Staff.')
}

const mapUserToEntry = (user: {
  id: string
  name: string
  email: string
  role: SpecialistRole
  specialistProfile: {
    credentials: string | null
    specialty: string | null
    subSpecialties: string[]
    yearsInPractice: number | null
    boardCertified: boolean
    languages: string[]
    insuranceAccepted: string[]
    phone: string | null
    email: string | null
    website: string | null
    photoUrl: string | null
    photoStorageKey: string | null
    address: string | null
    city: string | null
    state: string | null
    zip: string | null
    firstName: string | null
    lastName: string | null
  } | null
}) => {
  const profile = user.specialistProfile
  const nameFromProfile = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
  return {
    id: user.id,
    fullName: user.name || nameFromProfile,
    email: user.email,
    role: ROLE_LABELS[user.role],
    credentials: profile?.credentials || '',
    specialty: profile?.specialty || '',
    yearsInPractice: profile?.yearsInPractice ? String(profile.yearsInPractice) : '',
    boardCertified: profile?.boardCertified || false,
    photoUrl: profile?.photoUrl || '',
    phone: profile?.phone || '',
    website: profile?.website || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    zip: profile?.zip || '',
    languages: (profile?.languages || []).join(', '),
    subSpecialties: (profile?.subSpecialties || []).join(', '),
    insuranceAccepted: (profile?.insuranceAccepted || []).join(', '),
  }
}

/**
 * Get specialist profiles for the current clinic
 */
export async function getSpecialistProfiles(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw errors.unauthorized()
    }

    const users = await prisma.user.findMany({
      where: {
        clinicId: req.user.clinicId,
        role: { in: ['ADMIN', 'STAFF'] },
      },
      include: {
        specialistProfile: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    res.json({
      success: true,
      data: users.map((user) =>
        mapUserToEntry({
          ...user,
          role: user.role as SpecialistRole,
        })
      ),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create a specialist profile for the current clinic
 */
export async function createSpecialistProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw errors.unauthorized()
    }

    const {
      fullName,
      email,
      role,
      credentials,
      specialty,
      yearsInPractice,
      boardCertified,
      phone,
      website,
      address,
      city,
      state,
      zip,
      languages,
      subSpecialties,
      insuranceAccepted,
    } = req.body as {
      fullName?: string
      email?: string
      role?: string
      credentials?: string
      specialty?: string
      yearsInPractice?: string | number
      boardCertified?: boolean
      phone?: string
      website?: string
      address?: string
      city?: string
      state?: string
      zip?: string
      languages?: string[] | string
      subSpecialties?: string[] | string
      insuranceAccepted?: string[] | string
    }

    if (!fullName?.trim() || !email?.trim()) {
      throw errors.badRequest('Full name and email are required.')
    }

    const roleValue = parseRole(role)
    const trimmedEmail = email.trim()
    const trimmedName = fullName.trim()
    const { firstName, lastName } = splitName(trimmedName)

    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    })

    if (existingUser) {
      throw errors.conflict('Specialist with this email already exists.')
    }

    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: trimmedEmail,
          password: '',
          name: trimmedName,
          role: roleValue,
          clinicId: req.user!.clinicId,
        },
        include: { specialistProfile: true },
      })

      await tx.specialistProfile.create({
        data: {
          userId: user.id,
          clinicId: req.user!.clinicId,
          firstName,
          lastName,
          credentials: credentials?.trim() || null,
          specialty: specialty?.trim() || null,
          subSpecialties: normalizeList(subSpecialties),
          yearsInPractice: parseYearsInPractice(yearsInPractice),
          boardCertified: !!boardCertified,
          languages: normalizeList(languages),
          insuranceAccepted: normalizeList(insuranceAccepted),
          phone: phone?.trim() || null,
          email: trimmedEmail,
          website: website?.trim() || null,
          address: address?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          zip: zip?.trim() || null,
        },
      })

      return tx.user.findUnique({
        where: { id: user.id },
        include: { specialistProfile: true },
      })
    })

    if (!createdUser) {
      throw errors.internal('Failed to create specialist profile')
    }

    res.status(201).json({
      success: true,
      data: mapUserToEntry({
        ...createdUser,
        role: createdUser.role as SpecialistRole,
      }),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update a specialist profile for the current clinic
 */
export async function updateSpecialistProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw errors.unauthorized()
    }

    const { id } = req.params
    if (!id) {
      throw errors.badRequest('Specialist id is required.')
    }

    const {
      fullName,
      email,
      role,
      credentials,
      specialty,
      yearsInPractice,
      boardCertified,
      phone,
      website,
      address,
      city,
      state,
      zip,
      languages,
      subSpecialties,
      insuranceAccepted,
    } = req.body as {
      fullName?: string
      email?: string
      role?: string
      credentials?: string
      specialty?: string
      yearsInPractice?: string | number
      boardCertified?: boolean
      phone?: string
      website?: string
      address?: string
      city?: string
      state?: string
      zip?: string
      languages?: string[] | string
      subSpecialties?: string[] | string
      insuranceAccepted?: string[] | string
    }

    if (!fullName?.trim() || !email?.trim()) {
      throw errors.badRequest('Full name and email are required.')
    }

    const roleValue = parseRole(role)
    const trimmedEmail = email.trim()
    const trimmedName = fullName.trim()
    const { firstName, lastName } = splitName(trimmedName)

    const existingUser = await prisma.user.findFirst({
      where: { id, clinicId: req.user.clinicId },
    })

    if (!existingUser) {
      throw errors.notFound('Specialist not found')
    }

    const emailOwner = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    })

    if (emailOwner && emailOwner.id !== id) {
      throw errors.conflict('Another user already uses this email.')
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          name: trimmedName,
          email: trimmedEmail,
          role: roleValue,
        },
      })

      await tx.specialistProfile.upsert({
        where: { userId: id },
        create: {
          userId: id,
          clinicId: req.user!.clinicId,
          firstName,
          lastName,
          credentials: credentials?.trim() || null,
          specialty: specialty?.trim() || null,
          subSpecialties: normalizeList(subSpecialties),
          yearsInPractice: parseYearsInPractice(yearsInPractice),
          boardCertified: !!boardCertified,
          languages: normalizeList(languages),
          insuranceAccepted: normalizeList(insuranceAccepted),
          phone: phone?.trim() || null,
          email: trimmedEmail,
          website: website?.trim() || null,
          address: address?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          zip: zip?.trim() || null,
        },
        update: {
          firstName,
          lastName,
          credentials: credentials?.trim() || null,
          specialty: specialty?.trim() || null,
          subSpecialties: normalizeList(subSpecialties),
          yearsInPractice: parseYearsInPractice(yearsInPractice),
          boardCertified: !!boardCertified,
          languages: normalizeList(languages),
          insuranceAccepted: normalizeList(insuranceAccepted),
          phone: phone?.trim() || null,
          email: trimmedEmail,
          website: website?.trim() || null,
          address: address?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          zip: zip?.trim() || null,
        },
      })

      return tx.user.findUnique({
        where: { id },
        include: { specialistProfile: true },
      })
    })

    if (!updatedUser) {
      throw errors.internal('Failed to update specialist profile')
    }

    res.json({
      success: true,
      data: mapUserToEntry({
        ...updatedUser,
        role: updatedUser.role as SpecialistRole,
      }),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a specialist profile for the current clinic
 */
export async function deleteSpecialistProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw errors.unauthorized()
    }

    const { id } = req.params
    if (!id) {
      throw errors.badRequest('Specialist id is required.')
    }

    const specialist = await prisma.user.findFirst({
      where: {
        id,
        clinicId: req.user.clinicId,
        role: { in: ['ADMIN', 'STAFF'] },
      },
      include: { specialistProfile: true },
    })

    if (!specialist) {
      throw errors.notFound('Specialist not found')
    }

    if (specialist.specialistProfile?.photoStorageKey) {
      try {
        await deleteFile(specialist.specialistProfile.photoStorageKey)
      } catch (deleteError) {
        console.warn('Failed to remove specialist photo:', deleteError)
      }
    }

    await prisma.user.delete({
      where: { id },
    })

    res.json({
      success: true,
      data: { id },
      message: 'Specialist deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Upload specialist photo for a clinic user
 */
export async function uploadSpecialistPhotoForProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw errors.unauthorized()
    }

    const { id } = req.params
    if (!id) {
      throw errors.badRequest('Specialist id is required.')
    }

    const file = req.file as Express.Multer.File | undefined
    if (!file) {
      throw errors.badRequest('No photo file provided')
    }

    if (!file.mimetype.startsWith('image/')) {
      throw errors.badRequest('Photo must be an image file')
    }

    const specialist = await prisma.user.findFirst({
      where: {
        id,
        clinicId: req.user.clinicId,
        role: { in: ['ADMIN', 'STAFF'] },
      },
      include: { specialistProfile: true },
    })

    if (!specialist) {
      throw errors.notFound('Specialist not found')
    }

    if (specialist.specialistProfile?.photoStorageKey) {
      try {
        await deleteFile(specialist.specialistProfile.photoStorageKey)
      } catch (deleteError) {
        console.warn('Failed to remove old specialist photo:', deleteError)
      }
    }

    const uploadResult = await uploadSpecialistPhoto(
      file.buffer,
      file.originalname,
      file.mimetype,
      req.user.clinicId,
      id
    )

    await prisma.specialistProfile.upsert({
      where: { userId: id },
      create: {
        userId: id,
        clinicId: req.user.clinicId,
        photoUrl: uploadResult.fileUrl,
        photoStorageKey: uploadResult.storageKey,
      },
      update: {
        photoUrl: uploadResult.fileUrl,
        photoStorageKey: uploadResult.storageKey,
      },
    })

    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: { specialistProfile: true },
    })

    if (!updatedUser) {
      throw errors.notFound('User profile not found')
    }

    res.json({
      success: true,
      data: mapUserToEntry({
        ...updatedUser,
        role: updatedUser.role as SpecialistRole,
      }),
    })
  } catch (error) {
    next(error)
  }
}
