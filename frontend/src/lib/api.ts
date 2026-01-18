import axios, { AxiosInstance, AxiosError } from 'axios'

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

  // Log in development
  if (typeof window !== 'undefined') {
    console.log('🔗 API Configuration:', {
      'NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL,
      'API_URL': process.env.API_URL,
      'Final API URL': finalUrl,
      'Window origin': window.location.origin
    })
  }

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
 * Response interceptor for error handling
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
      delete api.defaults.headers.common['Authorization']
      console.warn('API authentication required - clearing session')

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
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

