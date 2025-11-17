import { Router } from 'express'
import * as dashboardController from '../controllers/dashboard.controller'
// import { authenticate } from '../middleware/auth.middleware'

const router = Router()

// Auth disabled for development
// router.use(authenticate)

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Public (dev mode)
 */
router.get('/stats', dashboardController.getDashboardStats)

export default router

