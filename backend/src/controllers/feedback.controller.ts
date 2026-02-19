import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { errors } from '../utils/errors'
import { logger } from '../utils/logger'

const FEEDBACK_TYPES = ['BUG', 'UI_CONFUSING', 'FEATURE_IDEA', 'DATA_ISSUE'] as const
const FEEDBACK_SEVERITIES = ['BLOCKING', 'HIGH', 'MEDIUM', 'LOW'] as const

type FeedbackType = (typeof FEEDBACK_TYPES)[number]
type FeedbackSeverity = (typeof FEEDBACK_SEVERITIES)[number]

/**
 * Submit feedback (Specialist portal)
 * POST /api/feedback
 */
export async function submitFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, description, severity, screen, context } = req.body

    if (!type || !FEEDBACK_TYPES.includes(type)) {
      throw errors.badRequest('Invalid or missing feedback type')
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      throw errors.badRequest('Description is required')
    }
    if (!severity || !FEEDBACK_SEVERITIES.includes(severity)) {
      throw errors.badRequest('Invalid or missing severity')
    }

    const feedback = await prisma.feedback.create({
      data: {
        source: 'SPECIALIST',
        type: type as FeedbackType,
        description: description.trim(),
        severity: severity as FeedbackSeverity,
        userId: req.user?.userId ?? null,
        screen: screen?.trim() || null,
        context: context && typeof context === 'object' ? context : null,
      },
    })

    logger.info({
      feedbackId: feedback.id,
      type: feedback.type,
      severity: feedback.severity,
      userId: feedback.userId,
      screen: feedback.screen,
    }, 'Feedback submitted (Specialist)')

    res.status(201).json({
      success: true,
      message: 'Thanks, your feedback has been sent.',
      id: feedback.id,
    })
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      return next(error)
    }
    logger.error({ err: error }, 'Failed to submit feedback')
    next(errors.internal('Failed to submit feedback'))
  }
}

/**
 * Submit feedback (GD portal)
 * POST /api/gd/feedback
 */
export async function submitGdFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, description, severity, screen, context } = req.body

    if (!type || !FEEDBACK_TYPES.includes(type)) {
      throw errors.badRequest('Invalid or missing feedback type')
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      throw errors.badRequest('Description is required')
    }
    if (!severity || !FEEDBACK_SEVERITIES.includes(severity)) {
      throw errors.badRequest('Invalid or missing severity')
    }

    const feedback = await prisma.feedback.create({
      data: {
        source: 'GD',
        type: type as FeedbackType,
        description: description.trim(),
        severity: severity as FeedbackSeverity,
        userId: req.user?.userId ?? null,
        screen: screen?.trim() || null,
        context: context && typeof context === 'object' ? context : null,
      },
    })

    logger.info({
      feedbackId: feedback.id,
      type: feedback.type,
      severity: feedback.severity,
      userId: feedback.userId,
      screen: feedback.screen,
    }, 'Feedback submitted (GD)')

    res.status(201).json({
      success: true,
      message: 'Thanks, your feedback has been sent.',
      id: feedback.id,
    })
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      return next(error)
    }
    logger.error({ err: error }, 'Failed to submit GD feedback')
    next(errors.internal('Failed to submit feedback'))
  }
}
