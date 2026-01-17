import { Router } from 'express'
import { body } from 'express-validator'
import * as authSupabaseController from '../controllers/auth.supabase.controller'
import { authenticateSupabase } from '../middleware/auth.supabase.middleware'
import { validateRequest } from '../middleware/validation.middleware'

const router = Router()

/**
 * @route   POST /api/auth/signup
 * @desc    Register new user and clinic with Supabase Auth
 * @access  Public
 */
router.post(
  '/signup',
  validateRequest([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    body('clinicName').notEmpty().withMessage('Clinic name is required'),
  ]),
  authSupabaseController.signup
)

/**
 * @route   POST /api/auth/oauth/complete
 * @desc    Complete OAuth signup (create clinic + profile)
 * @access  Private (requires Supabase token)
 */
router.post('/oauth/complete', authSupabaseController.completeOAuthSignup)

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private (requires Supabase token)
 */
router.get('/profile', authenticateSupabase, authSupabaseController.getProfile)

/**
 * @route   PUT /api/auth/profile
 * @desc    Update clinic profile
 * @access  Private (requires Supabase token)
 */
router.put('/profile', authenticateSupabase, authSupabaseController.updateProfile)

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post(
  '/resend-verification',
  validateRequest([
    body('email').isEmail().withMessage('Valid email is required'),
  ]),
  authSupabaseController.resendVerificationEmail
)

/**
 * @route   GET /api/auth/me (legacy - keeping for compatibility)
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticateSupabase, authSupabaseController.getProfile)

export default router

