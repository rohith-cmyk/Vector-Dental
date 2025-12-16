import { Router } from 'express'
import * as notificationsController from '../controllers/notifications.controller'
import { authenticateSupabase } from '../middleware/auth.supabase.middleware'

const router = Router()

// Apply authentication middleware to all routes
router.use(authenticateSupabase)

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for clinic
 * @query   filter: 'all' | 'unread'
 * @access  Public (dev mode)
 */
router.get('/', notificationsController.getNotifications)

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Public (dev mode)
 */
router.get('/unread-count', notificationsController.getUnreadCount)

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Public (dev mode)
 */
router.patch('/:id/read', notificationsController.markAsRead)

/**
 * @route   PATCH /api/notifications/referral/:referralId/read
 * @desc    Mark notification as read by referral ID
 * @access  Public (dev mode)
 */
router.patch('/referral/:referralId/read', notificationsController.markAsReadByReferral)

/**
 * @route   PATCH /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Public (dev mode)
 */
router.patch('/mark-all-read', notificationsController.markAllAsRead)

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Public (dev mode)
 */
router.delete('/:id', notificationsController.deleteNotification)

export default router

