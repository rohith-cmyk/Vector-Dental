import { config } from '../config/env'
import { errors } from './errors'
import twilio from 'twilio'

/**
 * Normalize phone to E.164 format for Twilio
 * Supports US/Canada: (555) 123-4567, 555-123-4567, 5551234567, +1 555 123 4567
 */
function normalizePhoneE164(phone: string | number | undefined | null): string {
  const trimmed = String(phone ?? '').trim()
  if (!trimmed) {
    throw errors.badRequest('Phone number is required')
  }

  const digits = trimmed.replace(/[^\d+]/g, '')
  if (digits.length === 0) {
    throw errors.badRequest('Invalid phone number format')
  }

  // Already in E.164 format
  if (digits.startsWith('+')) {
    if (digits.length >= 10) return digits
    throw errors.badRequest('Invalid phone number format')
  }

  // US/Canada: 10 digits
  if (digits.length === 10) {
    return `+1${digits}`
  }

  // US/Canada: 11 digits with leading 1
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }

  // International: assume already valid if 10+ digits
  if (digits.length >= 10) {
    return `+${digits}`
  }

  throw errors.badRequest('Invalid phone number format')
}

/**
 * Send SMS via Twilio
 * Throws on Twilio API errors. Use sendSmsSafe when SMS failure should not block the main operation.
 */
export async function sendSms(to: string, body: string): Promise<void> {
  if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioPhoneNumber) {
    console.warn(
      '[SMS] Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env'
    )
    return
  }

  const client = twilio(config.twilioAccountSid, config.twilioAuthToken)
  const normalizedTo = normalizePhoneE164(to)
  const message = await client.messages.create({
    body,
    to: normalizedTo,
    from: config.twilioPhoneNumber,
  })
  console.log('[SMS] Sent successfully:', message.sid, 'to:', normalizedTo)
}

/**
 * Send SMS - does NOT throw. Use when SMS failure should not block the main operation (e.g. referral submission).
 * Returns true if sent, false otherwise. Logs errors for debugging.
 */
export async function sendSmsSafe(to: string, body: string): Promise<boolean> {
  try {
    await sendSms(to, body)
    return true
  } catch (err: any) {
    console.warn('[SMS] Failed (operation continues):', err?.message || err, 'code:', err?.code)
    return false
  }
}
