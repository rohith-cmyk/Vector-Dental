import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { errors } from '../utils/errors'

/**
 * Get all notifications for a clinic
 */
export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    // Get clinic ID from authenticated user
    const clinicId = req.user?.clinicId

    if (!clinicId) {
      throw new Error('User does not belong to a clinic')
    }

    const { filter = 'all' } = req.query

    const where: any = {
      clinicId,
    }

    // Filter by read status
    if (filter === 'unread') {
      where.isRead = false
    }

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        referral: {
          select: {
            id: true,
            patientName: true,
            status: true,
            urgency: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Map notification types to lowercase for frontend compatibility
    const mappedNotifications = notifications.map(notif => ({
      ...notif,
      type: notif.type.toLowerCase() as any,
    }))

    res.json({
      success: true,
      data: mappedNotifications,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    // Get clinic ID from authenticated user
    const clinicId = req.user?.clinicId

    if (!clinicId) {
      throw new Error('User does not belong to a clinic')
    }

    const count = await prisma.notification.count({
      where: {
        clinicId,
        isRead: false,
      },
    })

    res.json({
      success: true,
      data: { count },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const clinicId = req.user?.clinicId

    if (!clinicId) {
      throw new Error('User does not belong to a clinic')
    }

    // Verify notification belongs to user's clinic
    const existingNotification = await prisma.notification.findFirst({
      where: { id, clinicId },
    })

    if (!existingNotification) {
      throw errors.notFound('Notification not found')
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })

    res.json({
      success: true,
      data: notification,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to update does not exist')) {
      throw errors.notFound('Notification not found')
    }
    next(error)
  }
}

/**
 * Mark notification as read by referral ID
 */
export async function markAsReadByReferral(req: Request, res: Response, next: NextFunction) {
  try {
    const { referralId } = req.params
    const clinicId = req.user?.clinicId

    if (!clinicId) {
      throw new Error('User does not belong to a clinic')
    }

    // Update all notifications for this referral and clinic
    const result = await prisma.notification.updateMany({
      where: {
        referralId,
        clinicId,
        isRead: false,
      },
      data: { isRead: true },
    })

    res.json({
      success: true,
      data: { count: result.count },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete notifications by referral ID
 */
export async function deleteByReferral(req: Request, res: Response, next: NextFunction) {
  try {
    const { referralId } = req.params
    const clinicId = req.user?.clinicId

    if (!clinicId) {
      throw new Error('User does not belong to a clinic')
    }

    const result = await prisma.notification.deleteMany({
      where: {
        referralId,
        clinicId,
      },
    })

    res.json({
      success: true,
      data: { count: result.count },
    })
  } catch (error) {
    next(error)
  }
}
/**
 * Mark all notifications as read for a clinic
 */
export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    // Get clinic ID from authenticated user
    const clinicId = req.user?.clinicId

    if (!clinicId) {
      throw new Error('User does not belong to a clinic')
    }

    const result = await prisma.notification.updateMany({
      where: {
        clinicId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    res.json({
      success: true,
      data: { count: result.count },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const clinicId = req.user?.clinicId

    if (!clinicId) {
      throw new Error('User does not belong to a clinic')
    }

    // Verify notification belongs to user's clinic
    const existingNotification = await prisma.notification.findFirst({
      where: { id, clinicId },
    })

    if (!existingNotification) {
      throw errors.notFound('Notification not found')
    }

    await prisma.notification.delete({
      where: { id },
    })

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      throw errors.notFound('Notification not found')
    }
    next(error)
  }
}

