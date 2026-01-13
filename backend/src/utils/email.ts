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

/**
 * Send email (placeholder for future email service integration)
 * Currently returns mailto link for client-side handling
 * 
 * TODO: Integrate with email service (SendGrid, AWS SES, etc.)
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; mailtoLink?: string }> {
  // For now, return mailto link
  // In production, integrate with actual email service
  const mailtoLink = generateMailtoLink(options)
  
  console.log('Email would be sent:', {
    to: options.to,
    subject: options.subject,
    mailtoLink,
  })
  
  return {
    success: true,
    mailtoLink,
  }
}

