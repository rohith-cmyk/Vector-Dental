'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'

interface ReferralTrendsChartProps {
  data: Array<{
    month: string
    outgoing: number
    incoming: number
  }>
}

export function ReferralTrendsChart({ data }: ReferralTrendsChartProps) {
  // Handle undefined or empty data
  const safeData = data || []
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Referral Trends</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Sent vs Received over time</p>
        </div>
        <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
          <option>Monthly</option>
          <option>Weekly</option>
          <option>Yearly</option>
        </select>
      </CardHeader>
      <CardContent>
        {safeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={safeData}>
            <defs>
              <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              stroke="#888"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#888"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="outgoing"
              name="Sent Out"
              stroke="#84cc16" 
              strokeWidth={2}
              fill="url(#colorOutgoing)" 
            />
            <Area 
              type="monotone" 
              dataKey="incoming"
              name="Received"
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#colorIncoming)" 
            />
          </AreaChart>
        </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No trend data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}

