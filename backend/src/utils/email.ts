import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import { config } from '../config/env'

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
        from: options.from || config.emailFrom || 'Dental Referral <onboarding@resend.dev>',
        to: [options.to],
        subject: options.subject,
        html: options.html || `<pre>${options.body}</pre>`,
        replyTo: options.replyTo,
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to send email via Resend:', error)
      // fall through to SMTP/mailto fallback
    }
  }

  const smtpTransporter = getTransporter()
  if (!smtpTransporter) {
    const mailtoLink = generateMailtoLink(options)
    return { success: true, mailtoLink }
  }

  try {
    await smtpTransporter.sendMail({
      from: options.from || config.emailFrom || config.smtpUser,
      to: options.to,
      subject: options.subject,
      text: options.body,
      html: options.html,
      replyTo: options.replyTo,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send email:', error)
    const mailtoLink = generateMailtoLink(options)
    return { success: false, mailtoLink }
  }
}

