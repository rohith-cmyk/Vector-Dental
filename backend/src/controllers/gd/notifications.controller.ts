import { Request, Response } from 'express'
import { prisma } from '../../config/database'
import { errors } from '../../utils/errors'

async function resolveClinicId(req: Request): Promise<string> {
  const gdUser = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { clinic: true },
  })

  const clinicId = gdUser?.clinicId || req.user?.clinicId
  if (!clinicId) {
    throw errors.notFound('Clinic not found for user')
  }

  return clinicId
}

/**
 * Get all notifications for a clinic (GD)
 */
export async function getNotifications(req: Request, res: Response) {
  try {
    const clinicId = await resolveClinicId(req)
    const { filter = 'all' } = req.query

    const where: any = { clinicId }
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
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const mapped = notifications.map((notif) => ({
      ...notif,
      type: notif.type.toLowerCase() as any,
    }))

    res.json({ success: true, data: mapped })
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch notifications',
    })
  }
}

/**
 * Get unread notification count (GD)
 */
export async function getUnreadCount(req: Request, res: Response) {
  try {
    const clinicId = await resolveClinicId(req)
    const count = await prisma.notification.count({
      where: { clinicId, isRead: false },
    })

    res.json({ success: true, data: { count } })
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch unread count',
    })
  }
}

/**
 * Mark all notifications as read (GD)
 */
export async function markAllAsRead(req: Request, res: Response) {
  try {
    const clinicId = await resolveClinicId(req)
    const result = await prisma.notification.updateMany({
      where: { clinicId, isRead: false },
      data: { isRead: true },
    })

    res.json({ success: true, data: { count: result.count } })
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to mark notifications as read',
    })
  }
}

/**
 * Mark notification as read (GD)
 */
export async function markAsRead(req: Request, res: Response) {
  try {
    const { id } = req.params
    const clinicId = await resolveClinicId(req)

    const existing = await prisma.notification.findFirst({
      where: { id, clinicId },
    })

    if (!existing) {
      throw errors.notFound('Notification not found')
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })

    res.json({ success: true, data: notification })
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to mark notification as read',
    })
  }
}
