import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { hashPassword, comparePassword } from '../utils/hash'
import { generateToken } from '../utils/jwt'
import { errors } from '../utils/errors'

/**
 * Sign up new user and clinic
 */
export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, clinicName } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw errors.conflict('User with this email already exists')
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create clinic and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create clinic
      const clinic = await tx.clinic.create({
        data: {
          name: clinicName,
        },
      })

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
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

    // Generate token
    const token = generateToken({
      userId: result.user.id,
      clinicId: result.user.clinicId,
      email: result.user.email,
      role: result.user.role,
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result.user

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        clinic: true,
      },
    })

    if (!user) {
      throw errors.unauthorized('Invalid email or password')
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      throw errors.unauthorized('Invalid email or password')
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      clinicId: user.clinicId,
      email: user.email,
      role: user.role,
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw errors.unauthorized()
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        clinic: true,
      },
    })

    if (!user) {
      throw errors.notFound('User not found')
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      data: userWithoutPassword,
    })
  } catch (error) {
    next(error)
  }
}

