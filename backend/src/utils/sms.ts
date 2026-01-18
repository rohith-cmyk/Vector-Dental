import { config } from '../config/env'
import { errors } from './errors'
import twilio from 'twilio'

function normalizePhoneE164(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) {
    return digits
  }
  if (digits.length === 10) {
    return `+1${digits}`
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  throw errors.badRequest('Invalid phone number format')
}

export async function sendSms(to: string, body: string): Promise<void> {
  if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioMessagingServiceSid) {
    throw errors.internal('Twilio configuration is missing')
  }

  const client = twilio(config.twilioAccountSid, config.twilioAuthToken)
  await client.messages.create({
    body,
    messagingServiceSid: config.twilioMessagingServiceSid,
    to: normalizePhoneE164(to),
  })
}
