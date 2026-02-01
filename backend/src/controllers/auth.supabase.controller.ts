import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin, supabase } from '../config/supabase'
import { prisma } from '../config/database'
import { errors } from '../utils/errors'
import { uploadClinicLogo } from '../utils/storage'

/**
 * Supabase Auth Controller
 * Handles authentication using Supabase Auth
 */

/**
 * Sign up new user and clinic with Supabase Auth
 * Flow:
 * 1. Create auth user in Supabase (sends verification email)
 * 2. Create clinic in database
 * 3. Link user profile to auth user
 */
export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, clinicName } = req.body

    // Validate input
    if (!email || !password || !name || !clinicName) {
      throw errors.badRequest('Missing required fields')
    }

    if (password.length < 6) {
      throw errors.badRequest('Password must be at least 6 characters')
    }

    // Check if user already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw errors.conflict('User with this email already exists')
    }

    // Create user in Supabase Auth (using public client to trigger email)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          clinicName,
        },
      },
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      throw errors.internal('Failed to create auth user: ' + authError.message)
    }

    if (!authData.user) {
      throw errors.internal('No user returned from Supabase')
    }

    const userId = authData.user.id

    try {
      // Create clinic and user in our database
      const result = await prisma.$transaction(async (tx) => {
        // Create clinic
        const clinic = await tx.clinic.create({
          data: {
            name: clinicName,
          },
        })

        // Create user profile linked to Supabase auth user
        const user = await tx.user.create({
          data: {
            id: userId, // Use Supabase auth user ID
            email,
            password: '', // Password managed by Supabase
            name,
            role: 'ADMIN', // First user is admin
            clinicId: clinic.id,
          },
          include: {
            clinic: true,
          },
        })

        return { user, clinic }
      })

      res.status(201).json({
        success: true,
        message: 'Account created! Please check your email to verify your account.',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            clinic: result.user.clinic,
          },
          requiresEmailVerification: true,
        },
      })
    } catch (dbError) {
      // Rollback: Delete the Supabase auth user if database transaction fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw dbError
    }
  } catch (error) {
    next(error)
  }
}

/**
 * Login user (Supabase handles this on frontend)
 * This endpoint is for getting user profile after Supabase login
 */
export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw errors.unauthorized()
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        clinic: true,
        specialistProfile: true,
      },
    })

    if (!user) {
      throw errors.notFound('User profile not found')
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clinicId: user.clinicId,
        clinic: user.clinic,
        specialistProfile: user.specialistProfile,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update clinic profile (name/email) for current user
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw errors.unauthorized()
    }

    const { clinicName, clinicEmail } = req.body as { clinicName?: string; clinicEmail?: string }

    if (!clinicName && !clinicEmail) {
      throw errors.badRequest('No profile fields provided')
    }

    const clinic = await prisma.clinic.update({
      where: { id: req.user.clinicId },
      data: {
        name: clinicName?.trim() || undefined,
        email: clinicEmail?.trim() || undefined,
      },
    })

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { clinic: true, specialistProfile: true },
    })

    if (!user) {
      throw errors.notFound('User profile not found')
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clinicId: user.clinicId,
        clinic: clinic || user.clinic,
        specialistProfile: user.specialistProfile,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update specialist profile for current user
 */
export async function updateSpecialistProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw errors.unauthorized()
    }

    const {
      firstName,
      lastName,
      credentials,
      specialty,
      subSpecialties,
      yearsInPractice,
      boardCertified,
      languages,
      insuranceAccepted,
      phone,
      email,
      website,
      address,
      city,
      state,
      zip,
    } = req.body as {
      firstName?: string
      lastName?: string
      credentials?: string
      specialty?: string
      subSpecialties?: string[]
      yearsInPractice?: number
      boardCertified?: boolean
      languages?: string[]
      insuranceAccepted?: string[]
      phone?: string
      email?: string
      website?: string
      address?: string
      city?: string
      state?: string
      zip?: string
    }

    const specialistProfile = await prisma.specialistProfile.upsert({
      where: { userId: req.user.userId },
      create: {
        userId: req.user.userId,
        clinicId: req.user.clinicId,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        credentials: credentials?.trim() || null,
        specialty: specialty?.trim() || null,
        subSpecialties: subSpecialties || [],
        yearsInPractice: typeof yearsInPractice === 'number' ? yearsInPractice : null,
        boardCertified: !!boardCertified,
        languages: languages || [],
        insuranceAccepted: insuranceAccepted || [],
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        website: website?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        zip: zip?.trim() || null,
      },
      update: {
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        credentials: credentials?.trim() || null,
        specialty: specialty?.trim() || null,
        subSpecialties: subSpecialties || [],
        yearsInPractice: typeof yearsInPractice === 'number' ? yearsInPractice : null,
        boardCertified: !!boardCertified,
        languages: languages || [],
        insuranceAccepted: insuranceAccepted || [],
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        website: website?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        zip: zip?.trim() || null,
      },
    })

    if (firstName || lastName) {
      const displayName = [firstName, lastName].filter(Boolean).join(' ').trim()
      if (displayName) {
        await prisma.user.update({
          where: { id: req.user.userId },
          data: { name: displayName },
        })
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { clinic: true, specialistProfile: true },
    })

    if (!user) {
      throw errors.notFound('User profile not found')
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clinicId: user.clinicId,
        clinic: user.clinic,
        specialistProfile: user.specialistProfile || specialistProfile,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Upload clinic logo for current user
 */
export async function uploadClinicLogoForProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw errors.unauthorized()
    }

    const file = req.file as Express.Multer.File | undefined
    if (!file) {
      throw errors.badRequest('No logo file provided')
    }

    if (!file.mimetype.startsWith('image/')) {
      throw errors.badRequest('Logo must be an image file')
    }

    const uploadResult = await uploadClinicLogo(
      file.buffer,
      file.originalname,
      file.mimetype,
      req.user.clinicId
    )

    const clinic = await prisma.clinic.update({
      where: { id: req.user.clinicId },
      data: {
        logoUrl: uploadResult.fileUrl,
        logoStorageKey: uploadResult.storageKey,
      },
    })

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { clinic: true },
    })

    if (!user) {
      throw errors.notFound('User profile not found')
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clinicId: user.clinicId,
        clinic: clinic || user.clinic,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Handle post-signup webhook from Supabase
 * (Optional: for additional processing after email confirmation)
 */
export async function handleAuthWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, record } = req.body

    if (type === 'INSERT' && record.email_confirmed_at) {
      // User has confirmed their email
      console.log(`✅ User ${record.email} confirmed their email`)

      // You can add additional logic here
      // e.g., send welcome email, create initial data, etc.
    }

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

/**
 * Complete OAuth signup by creating clinic + user profile
 */
export async function completeOAuthSignup(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw errors.unauthorized('No token provided')
    }

    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      throw errors.unauthorized('Invalid or expired token')
    }

    const { clinicName, name } = req.body as { clinicName?: string; name?: string }

    if (!clinicName) {
      throw errors.badRequest('Clinic name is required')
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { clinic: true },
    })

    if (existingUser) {
      res.json({
        success: true,
        data: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          clinicId: existingUser.clinicId,
          clinic: existingUser.clinic,
        },
      })
      return
    }

    const displayName =
      name ||
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      user.email?.split('@')[0] ||
      'User'

    const result = await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: {
          name: clinicName,
        },
      })

      const createdUser = await tx.user.create({
        data: {
          id: user.id,
          email: user.email || '',
          password: '',
          name: displayName,
          role: 'ADMIN',
          clinicId: clinic.id,
        },
        include: { clinic: true },
      })

      return { user: createdUser, clinic }
    })

    res.json({
      success: true,
      data: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        clinicId: result.user.clinicId,
        clinic: result.user.clinic,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body

    if (!email) {
      throw errors.badRequest('Email is required')
    }

    // Supabase doesn't have a direct "resend" method
    // User needs to try logging in, which will send a new email if unverified

    res.json({
      success: true,
      message: 'Please try logging in. If your email is not verified, we will send a new verification email.',
    })
  } catch (error) {
    next(error)
  }
}

