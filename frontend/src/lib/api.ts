import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

/**
 * Axios instance with default configuration
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor to add auth token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
    // Auth disabled for development - just log errors
    if (error.response?.status === 401) {
      console.warn('API authentication required (disabled in dev mode)')
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

