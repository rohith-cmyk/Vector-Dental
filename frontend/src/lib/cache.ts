/**
 * Simple cache utility for client-side caching
 * Uses localStorage for persistence across page reloads
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

const CACHE_PREFIX = 'dental_referral_cache_'
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

/**
 * Get cached data if it exists and hasn't expired
 */
export function getCachedData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null // Server-side: no cache

  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`)
    if (!cached) return null

    const entry: CacheEntry<T> = JSON.parse(cached)
    const now = Date.now()

    // Check if cache has expired
    if (now > entry.expiresAt) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`)
      return null
    }

    return entry.data
  } catch (error) {
    console.error('Error reading from cache:', error)
    return null
  }
}

/**
 * Store data in cache with TTL (time to live)
 */
export function setCachedData<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  if (typeof window === 'undefined') return // Server-side: no cache

  try {
    const now = Date.now()
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    }

    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry))
  } catch (error) {
    console.error('Error writing to cache:', error)
    // If localStorage is full, try to clear old entries
    if (error instanceof DOMException && error.code === 22) {
      clearExpiredCache()
      try {
        localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry))
      } catch (retryError) {
        console.error('Failed to cache after cleanup:', retryError)
      }
    }
  }
}

/**
 * Clear a specific cache entry
 */
export function clearCache(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`${CACHE_PREFIX}${key}`)
}

/**
 * Clear all expired cache entries
 */
export function clearExpiredCache(): void {
  if (typeof window === 'undefined') return

  const keys = Object.keys(localStorage)
  const now = Date.now()

  keys.forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      try {
        const cached = localStorage.getItem(key)
        if (cached) {
          const entry: CacheEntry<any> = JSON.parse(cached)
          if (now > entry.expiresAt) {
            localStorage.removeItem(key)
          }
        }
      } catch (error) {
        // Invalid cache entry, remove it
        localStorage.removeItem(key)
      }
    }
  })
}

/**
 * Clear all cache entries (use with caution)
 */
export function clearAllCache(): void {
  if (typeof window === 'undefined') return

  const keys = Object.keys(localStorage)
  keys.forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key)
    }
  })
}

/**
 * Get cache age in milliseconds
 */
export function getCacheAge(key: string): number | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`)
    if (!cached) return null

    const entry: CacheEntry<any> = JSON.parse(cached)
    return Date.now() - entry.timestamp
  } catch (error) {
    return null
  }
}

