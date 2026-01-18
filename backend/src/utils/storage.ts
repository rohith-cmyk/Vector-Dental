import { supabaseAdmin } from '../config/supabase'
import { config } from '../config/env'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import crypto from 'crypto'

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'referral-files'

export interface FileUploadResult {
  storageKey: string
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
}

/**
 * Upload a file to storage (Supabase Storage or local filesystem)
 * @param file - File buffer or stream
 * @param fileName - Original file name
 * @param mimeType - MIME type of the file
 * @param referralId - Optional referral ID for organizing files
 * @returns File upload result with storage key and URL
 */
export async function uploadFile(
  file: Buffer,
  fileName: string,
  mimeType: string,
  referralId?: string
): Promise<FileUploadResult> {
  // Generate a unique storage key
  const uniqueId = crypto.randomBytes(16).toString('hex')
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const storageKey = referralId
    ? `referrals/${referralId}/${uniqueId}-${sanitizedFileName}`
    : `uploads/${uniqueId}-${sanitizedFileName}`

  // Use Supabase Storage if configured, otherwise use local filesystem
  if (config.nodeEnv === 'production' || process.env.USE_SUPABASE_STORAGE === 'true') {
    return uploadToSupabase(file, storageKey, mimeType, fileName)
  } else {
    return uploadToLocal(file, storageKey, fileName, mimeType)
  }
}

/**
 * Upload a clinic logo to storage
 * @param file - File buffer
 * @param fileName - Original file name
 * @param mimeType - MIME type of the file
 * @param clinicId - Clinic ID for organizing files
 * @returns File upload result with storage key and URL
 */
export async function uploadClinicLogo(
  file: Buffer,
  fileName: string,
  mimeType: string,
  clinicId: string
): Promise<FileUploadResult> {
  const uniqueId = crypto.randomBytes(16).toString('hex')
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const storageKey = `clinic-logos/${clinicId}/${uniqueId}-${sanitizedFileName}`

  if (config.nodeEnv === 'production' || process.env.USE_SUPABASE_STORAGE === 'true') {
    return uploadToSupabase(file, storageKey, mimeType, fileName)
  }

  return uploadToLocal(file, storageKey, fileName, mimeType)
}

/**
 * Upload file to Supabase Storage
 */
async function uploadToSupabase(
  file: Buffer,
  storageKey: string,
  mimeType: string,
  fileName: string
): Promise<FileUploadResult> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(storageKey, file, {
        contentType: mimeType,
        upsert: false, // Don't overwrite existing files
      })

    if (error) {
      throw new Error(`Failed to upload file to Supabase: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storageKey)

    return {
      storageKey: data.path,
      fileUrl: urlData.publicUrl,
      fileName,
      fileSize: file.length,
      mimeType,
    }
  } catch (error: any) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }
}

/**
 * Upload file to local filesystem (for development)
 */
async function uploadToLocal(
  file: Buffer,
  storageKey: string,
  fileName: string,
  mimeType: string
): Promise<FileUploadResult> {
  try {
    const uploadDir = join(process.cwd(), config.uploadDir)
    const filePath = join(uploadDir, storageKey)

    // Create directory if it doesn't exist
    const dirPath = dirname(filePath)
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true })
    }

    // Write file synchronously (for simplicity in MVP)
    writeFileSync(filePath, file)

    // Return local URL (in production, this would be served by a static file server)
    const fileUrl = `/uploads/${storageKey}`

    return {
      storageKey,
      fileUrl,
      fileName,
      fileSize: file.length,
      mimeType,
    }
  } catch (error: any) {
    throw new Error(`Local file upload failed: ${error.message}`)
  }
}

/**
 * Get file URL from storage key
 * @param storageKey - Storage key/path
 * @returns Public URL to access the file
 */
export async function getFileUrl(storageKey: string): Promise<string> {
  if (config.nodeEnv === 'production' || process.env.USE_SUPABASE_STORAGE === 'true') {
    const { data } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(storageKey)
    return data.publicUrl
  } else {
    return `/uploads/${storageKey}`
  }
}

/**
 * Delete a file from storage
 * @param storageKey - Storage key/path to delete
 */
export async function deleteFile(storageKey: string): Promise<void> {
  if (config.nodeEnv === 'production' || process.env.USE_SUPABASE_STORAGE === 'true') {
    const { error } = await supabaseAdmin.storage.from(BUCKET_NAME).remove([storageKey])
    if (error) {
      throw new Error(`Failed to delete file from Supabase: ${error.message}`)
    }
  } else {
    // For local files, we could delete here, but we'll skip for now
    // as file cleanup can be handled separately
    console.warn(`Local file deletion not implemented: ${storageKey}`)
  }
}
