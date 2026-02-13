import { sendEmail } from './email'
import { sendSmsSafe } from './sms'

type PatientContact = {
  referralId: string
  name: string
  phone?: string | null
  email?: string | null
}

type SpecialistDetails = {
  name: string
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  clinicEmail: string
  calendarUrl: string
}

type ReminderSchedule = {
  minHours: number
  maxHours: number
  maxReminders: number
}

const DEFAULT_SPECIALIST: SpecialistDetails = {
  name: 'Dr. Avery Morgan, Endodontist',
  clinicName: 'BrightSmile Endodontics',
  clinicAddress: '123 Main St, Suite 400, San Diego, CA 92101',
  clinicPhone: '(619) 555-0123',
  clinicEmail: 'appointments@brightsmile-endo.com',
  calendarUrl: 'https://calendly.com/brightsmile-endo/new-patient',
}

const DEFAULT_REMINDER_SCHEDULE: ReminderSchedule = {
  minHours: 48,
  maxHours: 72,
  maxReminders: 3,
}

const scheduledReferrals = new Set<string>()

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const buildSchedulingMessage = (
  patientName: string,
  specialist: SpecialistDetails,
  isReminder: boolean,
  reminderNumber?: number
) => {
  const reminderPrefix = isReminder
    ? `Reminder ${reminderNumber || 1}: `
    : ''
  return (
    `${reminderPrefix}Hi ${patientName}, please schedule your specialist appointment.\n` +
    `${specialist.name} at ${specialist.clinicName}\n` +
    `Location: ${specialist.clinicAddress}\n` +
    `Phone: ${specialist.clinicPhone}\n` +
    `Email: ${specialist.clinicEmail}\n` +
    `Schedule here: ${specialist.calendarUrl}`
  )
}

const buildSchedulingEmail = (
  patientName: string,
  specialist: SpecialistDetails,
  isReminder: boolean,
  reminderNumber?: number
) => {
  const subjectPrefix = isReminder ? `Reminder ${reminderNumber || 1}: ` : ''
  const subject = `${subjectPrefix}Schedule your specialist appointment`
  const body = buildSchedulingMessage(patientName, specialist, isReminder, reminderNumber)
  return { subject, body }
}

const canContact = (contact: PatientContact) => Boolean(contact.phone || contact.email)

const sendSchedulingNotice = async (
  contact: PatientContact,
  specialist: SpecialistDetails,
  isReminder: boolean,
  reminderNumber?: number
) => {
  if (!canContact(contact)) return
  const message = buildSchedulingMessage(contact.name, specialist, isReminder, reminderNumber)

  if (contact.phone) {
    await sendSmsSafe(contact.phone, message)
  }

  if (contact.email) {
    const email = buildSchedulingEmail(contact.name, specialist, isReminder, reminderNumber)
    try {
      await sendEmail({
        to: contact.email,
        subject: email.subject,
        body: email.body,
      })
    } catch (emailError) {
      console.warn('Failed to send scheduling email:', emailError)
    }
  }
}

export async function sendInitialSchedulingNotice(
  contact: PatientContact,
  specialist: SpecialistDetails = DEFAULT_SPECIALIST
) {
  await sendSchedulingNotice(contact, specialist, false)
}

export function scheduleSchedulingReminders(
  contact: PatientContact,
  specialist: SpecialistDetails = DEFAULT_SPECIALIST,
  schedule: ReminderSchedule = DEFAULT_REMINDER_SCHEDULE
) {
  if (!canContact(contact)) return
  if (scheduledReferrals.has(contact.referralId)) return
  scheduledReferrals.add(contact.referralId)

  for (let i = 1; i <= schedule.maxReminders; i += 1) {
    const delayHours = randomInt(schedule.minHours, schedule.maxHours)
    const delayMs = delayHours * 60 * 60 * 1000
    setTimeout(() => {
      void sendSchedulingNotice(contact, specialist, true, i)
    }, delayMs * i)
  }
}
