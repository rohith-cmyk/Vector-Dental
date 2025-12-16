import crypto from 'crypto'
import { hashPassword, comparePassword } from './hash'

/**
 * Generate a cryptographically secure random token for referral links
 * Returns a base64url-encoded token (32-64 characters)
 */
export function generateReferralToken(): string {
  // Generate 32 random bytes and encode as base64url (URL-safe)
  const randomBytes = crypto.randomBytes(32)
  return randomBytes.toString('base64url')
}

/**
 * Generate a random numeric access code (6-8 digits)
 * @param length - Length of the access code (default: 6)
 */
export function generateAccessCode(length: number = 6): string {
  if (length < 4 || length > 8) {
    throw new Error('Access code length must be between 4 and 8 digits')
  }

  // Generate random number between 10^(length-1) and 10^length - 1
  const min = Math.pow(10, length - 1)
  const max = Math.pow(10, length) - 1
  const code = crypto.randomInt(min, max + 1)
  return code.toString().padStart(length, '0')
}

/**
 * Hash an access code using bcrypt
 * @param accessCode - Plaintext access code
 * @returns Hashed access code
 */
export async function hashAccessCode(accessCode: string): Promise<string> {
  return hashPassword(accessCode)
}

/**
 * Verify an access code against its hash
 * @param accessCode - Plaintext access code to verify
 * @param hash - Hashed access code to compare against
 * @returns True if codes match, false otherwise
 */
export async function verifyAccessCode(accessCode: string, hash: string): Promise<boolean> {
  return comparePassword(accessCode, hash)
}
