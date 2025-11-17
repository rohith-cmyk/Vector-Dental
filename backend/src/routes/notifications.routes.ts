import { Router } from 'express'
import * as notificationsController from '../controllers/notifications.controller'
// import { authenticate } from '../middleware/auth.middleware'

const router = Router()

// Auth disabled for development
// router.use(authenticate)

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

