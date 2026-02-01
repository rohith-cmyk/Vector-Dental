import { Router } from 'express'
import authRoutes from './auth.routes'
import contactsRoutes from './contacts.routes'
import referralsRoutes from './referrals.routes'
import dashboardRoutes from './dashboard.routes'
import publicRoutes from './public.routes'
import referralLinkRoutes from './referral-link.routes'
import magicReferralLinkRoutes from './magic-referral-link.routes'
import notificationsRoutes from './notifications.routes'
import gdRoutes from './gd'

const router = Router()

// Mount routes
router.use('/auth', authRoutes)
router.use('/contacts', contactsRoutes)
router.use('/referrals', referralsRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/public', publicRoutes) // Public routes (no auth required)
router.use('/referral-link', referralLinkRoutes) // Clinic referral link management (slug-based)
router.use('/referral-links', magicReferralLinkRoutes) // Referral link management (token-based)
router.use('/notifications', notificationsRoutes) // Notifications
router.use('/gd', gdRoutes) // GD Platform routes

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  })
})

export default router

