import { config } from '../config/env'
import { errors } from './errors'
import twilio from 'twilio'

export async function sendSms(to: string, body: string): Promise<void> {
  if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioMessagingServiceSid) {
    throw errors.internal('Twilio configuration is missing')
  }

  const client = twilio(config.twilioAccountSid, config.twilioAuthToken)
  await client.messages.create({
    body,
    messagingServiceSid: config.twilioMessagingServiceSid,
    to,
  })
}
