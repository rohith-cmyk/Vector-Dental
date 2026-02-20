import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from .env file in the backend directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

/**
 * Environment Configuration
 */
export const config = {
  // Port
  port: parseInt(process.env.PORT || '4000'),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  directUrl: process.env.DIRECT_URL || '',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Specialist Portal URL - base URL for referral links (refer-magic lives on Specialist portal)
  // Must be a single URL, NOT comma-separated like CORS_ORIGIN
  specialistPortalUrl: process.env.SPECIALIST_PORTAL_URL || 'http://localhost:3000',

  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'referral-files',

  // Email (SMTP)
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '465'),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.EMAIL_FROM || 'noreply@dentalreferral.com',

  // Email (Resend)
  resendApiKey: process.env.RESEND_API_KEY || '',

  // SMS (Twilio)
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioMessagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
}
