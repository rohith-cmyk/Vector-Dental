import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/database'
import { supabaseAdmin } from '../../config/supabase'
import { errors } from '../../utils/errors'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const signGdToken = (user: { id: string; email: string; role: string; clinicId: string | null }) => {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role,
            clinicId: user.clinicId,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    )
}

const getSupabaseUserFromRequest = async (req: Request) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw errors.unauthorized('No token provided')
    }

    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
        throw errors.unauthorized('Invalid or expired token')
    }

    return user
}

/**
 * GD Signup
 * Creates a new General Dentist user and their clinic
 */
export async function signup(req: Request, res: Response) {
    try {
        const {
            // Practice info
            practiceName,
            practicePhone,
            practiceAddress,
            practiceEmail,

            // User info
            userName,
            userEmail,
            password,
        } = req.body

        // Validate required fields
        if (!practiceName || !userName || !userEmail || !password) {
            throw errors.badRequest('Missing required fields')
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: userEmail }
        })

        if (existingUser) {
            throw errors.conflict('User with this email already exists')
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create clinic and user in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create clinic
            const clinic = await tx.clinic.create({
                data: {
                    name: practiceName,
                    phone: practicePhone,
                    address: practiceAddress,
                    email: practiceEmail || userEmail,
                }
            })

            // Create user
            const user = await tx.user.create({
                data: {
                    email: userEmail,
                    password: hashedPassword,
                    name: userName,
                    role: 'GENERAL_DENTIST',
                    clinicId: clinic.id,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    clinicId: true,
                    createdAt: true,
                }
            })

            return { user, clinic }
        })

        // Generate JWT token
        const token = signGdToken(result.user)

        res.status(201).json({
            success: true,
            data: {
                user: result.user,
                clinic: result.clinic,
                token,
            }
        })
    } catch (error: any) {
        console.error('GD Signup error:', error)
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to create account'
        })
    }
}

/**
 * GD Login
 * Authenticates a General Dentist user
 */
export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            throw errors.badRequest('Email and password are required')
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                clinic: true,
            }
        })

        if (!user) {
            throw errors.unauthorized('Invalid credentials')
        }

        // Check if user is a GD
        if (user.role !== 'GENERAL_DENTIST') {
            throw errors.forbidden('This login is for General Dentists only')
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            throw errors.unauthorized('Invalid credentials')
        }

        // Generate JWT token
        const token = signGdToken(user)

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user

        res.json({
            success: true,
            data: {
                user: userWithoutPassword,
                token,
            }
        })
    } catch (error: any) {
        console.error('GD Login error:', error)
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Login failed'
        })
    }
}

/**
 * GD OAuth status
 * Checks if a Supabase OAuth user already has a GD profile
 */
export async function oauthStatus(req: Request, res: Response) {
    try {
        const user = await getSupabaseUserFromRequest(req)

        const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { clinic: true },
        })

        if (!existingUser) {
            const displayName =
                (user.user_metadata?.full_name as string | undefined) ||
                (user.user_metadata?.name as string | undefined) ||
                user.email?.split('@')[0] ||
                'User'

            res.json({
                success: true,
                data: {
                    exists: false,
                    email: user.email,
                    name: displayName,
                },
            })
            return
        }

        if (existingUser.role !== 'GENERAL_DENTIST') {
            throw errors.forbidden('This account is not a General Dentist')
        }

        const token = signGdToken(existingUser)

        const { password: _, ...userWithoutPassword } = existingUser

        res.json({
            success: true,
            data: {
                exists: true,
                user: userWithoutPassword,
                clinic: existingUser.clinic,
                token,
            },
        })
    } catch (error: any) {
        console.error('GD OAuth status error:', error)
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to check OAuth status',
        })
    }
}

/**
 * GD OAuth complete
 * Creates clinic + user profile for Supabase OAuth user
 */
export async function completeOAuthSignup(req: Request, res: Response) {
    try {
        const user = await getSupabaseUserFromRequest(req)
        const { practiceName, practicePhone, practiceAddress } = req.body

        if (!practiceName) {
            throw errors.badRequest('Practice name is required')
        }

        const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { clinic: true },
        })

        if (existingUser) {
            if (existingUser.role !== 'GENERAL_DENTIST') {
                throw errors.forbidden('This account is not a General Dentist')
            }

            const token = signGdToken(existingUser)
            const { password: _, ...userWithoutPassword } = existingUser

            res.json({
                success: true,
                data: {
                    user: userWithoutPassword,
                    clinic: existingUser.clinic,
                    token,
                },
            })
            return
        }

        const email = user.email || ''
        if (!email) {
            throw errors.badRequest('Email is required')
        }

        const emailConflict = await prisma.user.findUnique({
            where: { email },
        })

        if (emailConflict) {
            throw errors.conflict('User with this email already exists')
        }

        const displayName =
            (user.user_metadata?.full_name as string | undefined) ||
            (user.user_metadata?.name as string | undefined) ||
            email.split('@')[0] ||
            'User'

        const result = await prisma.$transaction(async (tx) => {
            const clinic = await tx.clinic.create({
                data: {
                    name: practiceName,
                    phone: practicePhone,
                    address: practiceAddress,
                    email: email,
                },
            })

            const createdUser = await tx.user.create({
                data: {
                    id: user.id,
                    email,
                    password: '',
                    name: displayName,
                    role: 'GENERAL_DENTIST',
                    clinicId: clinic.id,
                },
                include: { clinic: true },
            })

            return { user: createdUser, clinic }
        })

        const token = signGdToken(result.user)
        const { password: _, ...userWithoutPassword } = result.user

        res.json({
            success: true,
            data: {
                user: userWithoutPassword,
                clinic: result.clinic,
                token,
            },
        })
    } catch (error: any) {
        console.error('GD OAuth complete error:', error)
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to complete OAuth signup',
        })
    }
}
