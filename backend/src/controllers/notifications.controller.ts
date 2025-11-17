import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { errors } from '../utils/errors'

/**
 * Get all notifications for a clinic
 */
export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    // For development: use demo user's clinic if no auth
    let clinicId = req.user?.clinicId
    
    if (!clinicId) {
      // Try to get clinic from demo user (admin@dental.com)
      const demoUser = await prisma.user.findUnique({
        where: { email: 'admin@dental.com' },
        include: { clinic: true },
      })
      
      if (demoUser && demoUser.clinic) {
        clinicId = demoUser.clinicId
        console.log(`📬 Using demo user's clinic: ${demoUser.clinic.name} (ID: ${clinicId})`)
      } else {
        // Fallback: Get first clinic from database
        const firstClinic = await prisma.clinic.findFirst()
        if (!firstClinic) {
          return res.json({
            success: true,
            data: [],
          })
        }
        clinicId = firstClinic.id
        console.log(`📬 Using first clinic: ${firstClinic.name} (ID: ${clinicId})`)
      }
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
    // For development: use demo user's clinic if no auth
    let clinicId = req.user?.clinicId
    
    if (!clinicId) {
      const demoUser = await prisma.user.findUnique({
        where: { email: 'admin@dental.com' },
        include: { clinic: true },
      })
      
      if (demoUser && demoUser.clinic) {
        clinicId = demoUser.clinicId
      } else {
        const firstClinic = await prisma.clinic.findFirst()
        if (!firstClinic) {
          return res.json({
            success: true,
            data: { count: 0 },
          })
        }
        clinicId = firstClinic.id
      }
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
 * Mark all notifications as read for a clinic
 */
export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    // For development: use demo user's clinic if no auth
    let clinicId = req.user?.clinicId
    
    if (!clinicId) {
      const demoUser = await prisma.user.findUnique({
        where: { email: 'admin@dental.com' },
        include: { clinic: true },
      })
      
      if (demoUser && demoUser.clinic) {
        clinicId = demoUser.clinicId
      } else {
        const firstClinic = await prisma.clinic.findFirst()
        if (!firstClinic) {
          return res.json({
            success: true,
            data: { count: 0 },
          })
        }
        clinicId = firstClinic.id
      }
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

