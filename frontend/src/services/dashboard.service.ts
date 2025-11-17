import { api } from '@/lib/api'
import type { DashboardStats } from '@/types'

/**
 * Dashboard Service
 */
export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    try {
      const fullUrl = `${api.defaults.baseURL}/dashboard/stats`
      console.log('📊 Fetching dashboard stats from:', fullUrl)
      console.log('📊 API base URL:', api.defaults.baseURL)
      console.log('📊 Request path:', '/dashboard/stats')
      const response = await api.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats')
      
      console.log('📊 Dashboard API response:', response.data)
      
      // Backend returns { success: true, data: {...} }
      if (response.data.success && response.data.data) {
        console.log('✅ Dashboard data loaded successfully:', response.data.data)
        return response.data.data
      }
      
      // Fallback to direct response if format is different
      console.warn('⚠️ Unexpected response format, using direct response:', response.data)
      return response.data as any
    } catch (error: any) {
      // Log the full error for debugging
      console.error('❌ Dashboard API failed:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      })
      
      // Re-throw the error so the UI can handle it properly
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to load dashboard data. Please check your connection and try again.'
      )
    }
  },
}

