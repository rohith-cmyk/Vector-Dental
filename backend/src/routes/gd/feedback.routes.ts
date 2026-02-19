import { Router } from 'express'
import * as feedbackController from '../../controllers/feedback.controller'
import { optionalAuthenticate } from '../../middleware/auth.middleware'

const router = Router()

/**
 * @route   POST /api/gd/feedback
 * @desc    Submit feedback (GD portal)
 * @access  Public (optional auth - captures userId if logged in)
 */
router.post('/', optionalAuthenticate, feedbackController.submitGdFeedback)

export default router
