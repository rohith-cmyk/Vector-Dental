import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { getDashboardStats } from '../../controllers/gd/dashboard.controller'

const router = Router()

/**
 * @route   GET /api/gd/dashboard/stats
 * @desc    Get dashboard statistics for GD
 * @access  Private (GD only)
 */
router.get('/stats', authenticate, getDashboardStats)

export default router
