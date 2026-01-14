import { api } from '@/lib/api'
import type { DashboardStats } from '@/types'
import { getCachedData, setCachedData, getCacheAge, clearCache as clearCacheUtil } from '@/lib/cache'

const CACHE_KEY = 'dashboard_stats'
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes - dashboard data can be slightly stale

/**
 * Internal function to fetch stats from API (without cache logic)
 */
async function fetchStatsFromAPI(): Promise<DashboardStats> {
  const fullUrl = `${api.defaults.baseURL}/dashboard/stats`
  console.log('📊 Fetching dashboard stats from API:', fullUrl)
  
  const response = await api.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats')
  
  // Backend returns { success: true, data: {...} }
  if (response.data.success && response.data.data) {
    return response.data.data
  }
  
  // Fallback to direct response if format is different
  console.warn('⚠️ Unexpected response format, using direct response:', response.data)
  return response.data as any
}

/**
 * Dashboard Service with caching
 */
export const dashboardService = {
  /**
   * Get dashboard statistics with caching
   * - First checks cache, returns immediately if valid
   * - Fetches fresh data in background if cache is stale (>1 minute old)
   * - Falls back to cache if API fails
   */
  async getStats(forceRefresh: boolean = false): Promise<DashboardStats> {
    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = getCachedData<DashboardStats>(CACHE_KEY)
      if (cached) {
        const cacheAge = getCacheAge(CACHE_KEY) || 0
        console.log(`📊 Using cached dashboard data (age: ${Math.round(cacheAge / 1000)}s)`)
        
        // If cache is less than 1 minute old, return it immediately
        // Otherwise, return it but fetch fresh data in background
        if (cacheAge < 60 * 1000) {
          return cached
        } else {
          // Cache is stale but still valid - return it and refresh in background
          // Fetch fresh data in background without going through cache logic
          fetchStatsFromAPI()
            .then((stats) => {
              setCachedData(CACHE_KEY, stats, CACHE_TTL)
              console.log('✅ Dashboard data refreshed in background')
            })
            .catch((error) => {
              console.warn('⚠️ Background refresh failed:', error.message)
            })
          return cached
        }
      }
    }

    // No cache or force refresh - fetch from API
    try {
      const stats = await fetchStatsFromAPI()
      
      // Cache the fresh data
      setCachedData(CACHE_KEY, stats, CACHE_TTL)
      console.log('✅ Dashboard data loaded and cached successfully')
      
      return stats
    } catch (error: any) {
      // If API fails, try to return cached data as fallback
      const cached = getCachedData<DashboardStats>(CACHE_KEY)
      if (cached) {
        console.warn('⚠️ API failed, using stale cached data:', error.message)
        return cached
      }
      
      // No cache available - throw error
      console.error('❌ Dashboard API failed and no cache available:', error)
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to load dashboard data. Please check your connection and try again.'
      )
    }
  },

  /**
   * Clear dashboard cache (useful after mutations)
   */
  clearCache(): void {
    clearCacheUtil(CACHE_KEY)
  },
}

