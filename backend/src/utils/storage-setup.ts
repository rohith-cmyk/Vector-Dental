/**
 * Supabase Storage bucket setup
 * Ensures the referral-files bucket exists and is configured for public read
 */
import { supabaseAdmin } from '../config/supabase'
import { config } from '../config/env'
import { logger } from './logger'

const BUCKET_NAME = config.supabaseStorageBucket || 'referral-files'

export async function ensureStorageBucket(): Promise<void> {
  if (!config.supabaseServiceKey) {
    logger.warn('Supabase service key not configured - skipping storage bucket setup')
    return
  }

  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const exists = buckets?.some((b) => b.name === BUCKET_NAME)

    if (exists) {
      logger.info({ bucket: BUCKET_NAME }, 'Storage bucket exists')
      return
    }

    const { error } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
      public: true,
    })

    if (error) {
      logger.warn({ err: error, bucket: BUCKET_NAME }, 'Could not create storage bucket - create manually in Supabase Dashboard > Storage')
      return
    }

    logger.info({ bucket: BUCKET_NAME }, 'Created storage bucket')
  } catch (err: any) {
    logger.warn({ err }, 'Storage bucket setup failed')
  }
}
