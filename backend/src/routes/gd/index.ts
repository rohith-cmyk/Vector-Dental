import { Router } from 'express'
import authRoutes from './auth.routes'
import dashboardRoutes from './dashboard.routes'
import referralsRoutes from './referrals.routes'
import specialistsRoutes from './specialists.routes'
import notificationsRoutes from './notifications.routes'
import feedbackRoutes from './feedback.routes'

const router = Router()

// GD Routes
router.use('/auth', authRoutes)
router.use('/feedback', feedbackRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/referrals', referralsRoutes)
router.use('/specialists', specialistsRoutes)
router.use('/notifications', notificationsRoutes)

export default router
