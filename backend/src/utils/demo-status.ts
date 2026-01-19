import { prisma } from '../config/database'
import type { ReferralStatus } from '@prisma/client'
import { config } from '../config/env'
import { uploadFile } from './storage'
import { existsSync, readFileSync } from 'fs'
import { join, extname } from 'path'

const STATUS_ORDER: ReferralStatus[] = ['SUBMITTED', 'ACCEPTED', 'SENT', 'COMPLETED']
const DEMO_STEP_MS = Number(process.env.DEMO_STATUS_STEP_MS || 3000)
const POST_ACCEPT_STEP_MS = Number(process.env.POST_ACCEPT_STATUS_STEP_MS || 10000)

const shouldRunDemoAutomation = () => {
  if (process.env.DEMO_AUTO_STATUS === 'false') return false
  if (config.nodeEnv === 'production' && process.env.DEMO_AUTO_STATUS !== 'true') return false
  return true
}

const shouldAdvanceStatus = (currentStatus: ReferralStatus, nextStatus: ReferralStatus) => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)
  const nextIndex = STATUS_ORDER.indexOf(nextStatus)
  if (currentIndex === -1 || nextIndex === -1) return false
  return currentIndex < nextIndex
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const addDaysWithRandomTime = (date: Date, daysToAdd: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + daysToAdd)
  const hour = randomInt(9, 16)
  const minute = Math.random() < 0.5 ? 0 : 30
  next.setHours(hour, minute, 0, 0)
  return next
}

const getDemoFileCandidates = () => {
  const rootDir = join(process.cwd(), '..')
  const candidates = [
    'tooth xray.jpg',
    'tooth xray1.jpg',
    'tooth xray2.webp',
  ]

  return candidates
    .map((name) => join(rootDir, name))
    .filter((filePath) => existsSync(filePath))
}

const getMimeType = (filePath: string) => {
  const extension = extname(filePath).toLowerCase()
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg'
  if (extension === '.png') return 'image/png'
  if (extension === '.webp') return 'image/webp'
  return 'application/octet-stream'
}

const attachDemoOpsReport = async (referralId: string) => {
  const existingFiles = await prisma.referralFile.findMany({
    where: { referralId },
    select: { id: true, fileName: true },
  })
  if (existingFiles.length > 0) {
    const allScreenshots = existingFiles.every((file) => /screenshot/i.test(file.fileName))
    if (!(shouldRunDemoAutomation() && config.nodeEnv !== 'production' && allScreenshots)) {
      return
    }
    await prisma.referralFile.deleteMany({
      where: { referralId },
    })
  }

  const candidates = getDemoFileCandidates()
  if (candidates.length === 0) return

  const filesToUse = candidates.sort(() => 0.5 - Math.random()).slice(0, randomInt(1, Math.min(2, candidates.length)))

  for (const filePath of filesToUse) {
    try {
      const buffer = readFileSync(filePath)
      const fileName = filePath.split('/').pop() || 'xray'
      const mimeType = getMimeType(filePath)
      const uploadResult = await uploadFile(buffer, fileName, mimeType, referralId)

      await prisma.referralFile.create({
        data: {
          referralId,
          fileName: uploadResult.fileName,
          fileType: uploadResult.mimeType.split('/')[1] || 'unknown',
          fileUrl: uploadResult.fileUrl,
          fileSize: uploadResult.fileSize,
          storageKey: uploadResult.storageKey,
          mimeType: uploadResult.mimeType,
        },
      })
    } catch (error) {
      console.warn(`[demo-status] Failed to attach demo file ${filePath}`, error)
    }
  }
}

export function scheduleDemoStatusProgression(referralId: string) {
  if (!shouldRunDemoAutomation()) return

  const now = new Date()
  const acceptedAt = new Date(now.getTime() + randomInt(5, 20) * 60 * 1000)
  const scheduledAt = addDaysWithRandomTime(acceptedAt, randomInt(1, 3))
  const completedAt = new Date(scheduledAt.getTime() + randomInt(1, 3) * 60 * 60 * 1000)
  const postOpScheduledAt = addDaysWithRandomTime(completedAt, randomInt(3, 7))

  const steps: Array<{ delayMs: number; status: ReferralStatus }> = [
    { delayMs: DEMO_STEP_MS, status: 'ACCEPTED' },
    { delayMs: DEMO_STEP_MS * 2, status: 'SENT' },
    { delayMs: DEMO_STEP_MS * 3, status: 'COMPLETED' },
  ]

  steps.forEach(({ delayMs, status }) => {
    setTimeout(async () => {
      try {
        const existing = await prisma.referral.findUnique({
          where: { id: referralId },
          select: { status: true, notes: true },
        })
        if (!existing) return
        if (!shouldAdvanceStatus(existing.status, status)) return

        await prisma.referral.update({
          where: { id: referralId },
          data: {
            status,
            acceptedAt: status === 'ACCEPTED' ? acceptedAt : undefined,
            scheduledAt: status === 'ACCEPTED' ? scheduledAt : undefined,
            completedAt: status === 'SENT' ? completedAt : undefined,
            postOpScheduledAt: status === 'COMPLETED' ? postOpScheduledAt : undefined,
            notes: status === 'SENT' && !existing.notes
              ? 'Post-op review completed. Healing is on track; follow-up scheduled as planned.'
              : undefined,
          },
        })

        if (status === 'SENT') {
          await attachDemoOpsReport(referralId)
        }
      } catch (error) {
        console.error(`[demo-status] Failed to advance referral ${referralId} to ${status}`, error)
      }
    }, delayMs)
  })
}

export function schedulePostAcceptStatusProgression(referralId: string) {
  if (!shouldRunDemoAutomation()) return

  const stepMs = POST_ACCEPT_STEP_MS
  const scheduledAt = new Date(Date.now() + stepMs)
  const completedAt = new Date(Date.now() + stepMs * 2)
  const postOpScheduledAt = new Date(Date.now() + stepMs * 3)

  setTimeout(async () => {
    try {
      const existing = await prisma.referral.findUnique({
        where: { id: referralId },
        select: { status: true, scheduledAt: true },
      })
      if (!existing) return
      if (existing.status !== 'ACCEPTED' || existing.scheduledAt) return

      await prisma.referral.update({
        where: { id: referralId },
        data: { scheduledAt },
      })
    } catch (error) {
      console.error(`[demo-status] Failed to schedule appointment for ${referralId}`, error)
    }
  }, stepMs)

  setTimeout(async () => {
    try {
      const existing = await prisma.referral.findUnique({
        where: { id: referralId },
        select: { status: true },
      })
      if (!existing) return
      if (!shouldAdvanceStatus(existing.status, 'SENT')) return

      await prisma.referral.update({
        where: { id: referralId },
        data: {
          status: 'SENT',
          completedAt,
        },
      })

      await attachDemoOpsReport(referralId)
    } catch (error) {
      console.error(`[demo-status] Failed to complete appointment for ${referralId}`, error)
    }
  }, stepMs * 2)

  setTimeout(async () => {
    try {
      const existing = await prisma.referral.findUnique({
        where: { id: referralId },
        select: { status: true },
      })
      if (!existing) return
      if (!shouldAdvanceStatus(existing.status, 'COMPLETED')) return

      await prisma.referral.update({
        where: { id: referralId },
        data: {
          status: 'COMPLETED',
          postOpScheduledAt,
        },
      })
    } catch (error) {
      console.error(`[demo-status] Failed to schedule post-op for ${referralId}`, error)
    }
  }, stepMs * 3)
}
