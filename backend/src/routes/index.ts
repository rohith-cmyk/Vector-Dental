import { Router } from 'express'
import authRoutes from './auth.routes'
import contactsRoutes from './contacts.routes'
import referralsRoutes from './referrals.routes'
import dashboardRoutes from './dashboard.routes'

const router = Router()

// Mount routes
router.use('/auth', authRoutes)
router.use('/contacts', contactsRoutes)
router.use('/referrals', referralsRoutes)
router.use('/dashboard', dashboardRoutes)

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  })
})

export default router

