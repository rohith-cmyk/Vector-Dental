import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import { config } from '../config/env'
import { logger } from './logger'

/**
 * Simple email utility
 * For now, returns a mailto: link as fallback
 * In production, integrate with SendGrid, AWS SES, or similar service
 */

export interface EmailOptions {
  to: string
  subject: string
  body: string
  html?: string
  from?: string
  replyTo?: string
}

/**
 * Generate a mailto: link for email sharing
 * This is a fallback when email service is not configured
 */
export function generateMailtoLink(options: EmailOptions): string {
  const subject = encodeURIComponent(options.subject)
  const body = encodeURIComponent(options.body)
  return `mailto:${options.to}?subject=${subject}&body=${body}`
}

let transporter: nodemailer.Transporter | null = null
let resendClient: Resend | null = null

function getResendClient(): Resend | null {
  if (!config.resendApiKey) {
    return null
  }

  if (!resendClient) {
    resendClient = new Resend(config.resendApiKey)
  }

  return resendClient
}

function getTransporter(): nodemailer.Transporter | null {
  if (!config.smtpUser || !config.smtpPass) {
    return null
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    })
  }

  return transporter
}

/**
 * Send email via SMTP (Gmail supported). Falls back to mailto if not configured.
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; mailtoLink?: string }> {
  const resend = getResendClient()
  if (resend) {
    try {
      await resend.emails.send({
        from: options.from || config.smtpFrom || 'Vector Referral <onboarding@resend.dev>',
        to: [options.to],
        subject: options.subject,
        html: options.html || `<pre>${options.body}</pre>`,
        replyTo: options.replyTo,
      })

      logger.info({ to: options.to, subject: options.subject }, 'Email sent via Resend')
      return { success: true }
    } catch (error: any) {
      logger.error(
        { err: error, to: options.to, subject: options.subject, resendError: error?.message, code: error?.statusCode },
        'Failed to send email via Resend'
      )
      // fall through to SMTP/mailto fallback
    }
  } else {
    logger.warn('RESEND_API_KEY not set - email will not be sent. Add it in Railway Variables.')
  }

  const smtpTransporter = getTransporter()
  if (!smtpTransporter) {
    const mailtoLink = generateMailtoLink(options)
    logger.warn({ to: options.to, subject: options.subject }, 'No email service configured (Resend/SMTP). Email NOT sent - mailto fallback only.')
    return { success: false, mailtoLink }
  }

  try {
    await smtpTransporter.sendMail({
      from: options.from || config.smtpFrom || config.smtpUser,
      to: options.to,
      subject: options.subject,
      text: options.body,
      html: options.html,
      replyTo: options.replyTo,
    })

    return { success: true }
  } catch (error: any) {
    logger.error({ err: error, to: options.to, subject: options.subject }, 'Failed to send email via SMTP')
    const mailtoLink = generateMailtoLink(options)
    return { success: false, mailtoLink }
  }
}

