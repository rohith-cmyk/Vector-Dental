import { Router } from 'express'
import * as dashboardController from '../controllers/dashboard.controller'
import { authenticateSupabase } from '../middleware/auth.supabase.middleware'

const router = Router()

// Apply authentication middleware to all routes
router.use(authenticateSupabase)

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', dashboardController.getDashboardStats)

export default router

