import { Router } from 'express'
import { signup, login, oauthStatus, completeOAuthSignup } from '../../controllers/gd/auth.controller'

const router = Router()

/**
 * @route   POST /api/gd/auth/signup
 * @desc    Register a new General Dentist user
 * @access  Public
 */
router.post('/signup', signup)

/**
 * @route   POST /api/gd/auth/login
 * @desc    Login as General Dentist
 * @access  Public
 */
router.post('/login', login)

/**
 * @route   GET /api/gd/auth/oauth/status
 * @desc    Check OAuth profile status for GD
 * @access  Public (Bearer Supabase token)
 */
router.get('/oauth/status', oauthStatus)

/**
 * @route   POST /api/gd/auth/oauth/complete
 * @desc    Complete OAuth signup for GD
 * @access  Public (Bearer Supabase token)
 */
router.post('/oauth/complete', completeOAuthSignup)

export default router
