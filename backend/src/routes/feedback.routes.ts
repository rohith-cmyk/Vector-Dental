import { Router } from 'express'
import * as feedbackController from '../controllers/feedback.controller'
import { optionalAuthenticateSupabase } from '../middleware/auth.supabase.middleware'

const router = Router()

/**
 * @route   POST /api/feedback
 * @desc    Submit feedback (Specialist portal)
 * @access  Public (optional auth - captures userId if logged in)
 */
router.post('/', optionalAuthenticateSupabase, feedbackController.submitFeedback)

export default router
