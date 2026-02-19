import { Router } from 'express'
import * as healthController from '../controllers/health.controller'
import authRoutes from './auth.routes'
import contactsRoutes from './contacts.routes'
import referralsRoutes from './referrals.routes'
import dashboardRoutes from './dashboard.routes'
import publicRoutes from './public.routes'
import referralLinkRoutes from './referral-link.routes'
import magicReferralLinkRoutes from './magic-referral-link.routes'
import notificationsRoutes from './notifications.routes'
import gdRoutes from './gd'
import specialistProfilesRoutes from './specialist-profiles.routes'
import feedbackRoutes from './feedback.routes'

const router = Router()

// Mount routes
router.use('/auth', authRoutes)
router.use('/feedback', feedbackRoutes)
router.use('/contacts', contactsRoutes)
router.use('/referrals', referralsRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/public', publicRoutes) // Public routes (no auth required)
router.use('/referral-link', referralLinkRoutes) // Clinic referral link management (slug-based)
router.use('/referral-links', magicReferralLinkRoutes) // Referral link management (token-based)
router.use('/notifications', notificationsRoutes) // Notifications
router.use('/specialist-profiles', specialistProfilesRoutes) // Specialist profiles (clinic staff)
router.use('/gd', gdRoutes) // Vector Referral GD routes

// Health check (DB connectivity, used by load balancers / k8s / Docker)
router.get('/health', healthController.getHealth)

export default router

