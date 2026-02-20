import axios, { AxiosInstance, AxiosError } from 'axios'
import { supabase } from '@/lib/supabase'

// Get API URL - always use full URL to avoid proxy issues
const getApiUrl = () => {
  // Check both NEXT_PUBLIC_API_URL and API_URL (for Next.js env)
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL
  const url = envUrl || 'http://localhost:4000'

  // Ensure URL ends with /api
  if (url.endsWith('/api')) {
    return url
  }
  // If URL ends with a slash, remove it before adding /api
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url
  const finalUrl = `${cleanUrl}/api`

  return finalUrl
}

export const API_URL = getApiUrl()

/**
 * Axios instance with default configuration
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increased timeout to 30 seconds for dashboard stats endpoint
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor to add auth token and log requests
 */
api.interceptors.request.use(
  (config) => {
    // Log the full URL being requested (in development)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const fullUrl = `${config.baseURL}${config.url}`
      console.log('🌐 API Request:', {
        method: config.method?.toUpperCase(),
        url: fullUrl,
        baseURL: config.baseURL,
        path: config.url,
      })
    }

    // Only access localStorage on client side (browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor: on 401, try to refresh Supabase session before redirecting
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }

    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Skip refresh for auth endpoints (login, signup) - 401 means bad credentials
      const url = String(originalRequest?.url || '')
      const isAuthEndpoint = url.includes('auth/login') || url.includes('auth/signup')

      if (!isAuthEndpoint && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()

          if (!refreshError && session?.access_token) {
            localStorage.setItem('auth_token', session.access_token)
            api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`
            originalRequest.headers.Authorization = `Bearer ${session.access_token}`
            return api(originalRequest)
          }
        } catch {
          // Refresh failed - fall through to clear and redirect
        }
      }

      // Refresh failed or auth endpoint - clear session and redirect
      localStorage.removeItem('auth_token')
      delete api.defaults.headers.common['Authorization']
      console.warn('Session expired - redirecting to login')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

/**
 * API Error handler
 */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'An error occurred'
  }
  return 'An unexpected error occurred'
}

