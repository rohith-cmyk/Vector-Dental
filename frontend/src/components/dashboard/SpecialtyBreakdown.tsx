'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

interface SpecialtyBreakdownProps {
  data: Array<{
    specialty: string
    count: number
    percentage: number
  }>
}

const COLORS = ['#84cc16', '#65a30d', '#4d7c0f', '#fbbf24']

export function SpecialtyBreakdown({ data }: SpecialtyBreakdownProps) {
  const chartData = data.map((item) => ({
    name: item.specialty,
    value: item.count,
  }))
  
  const totalSales = data.reduce((sum, item) => sum + item.count, 0)
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Referrals by Specialty</CardTitle>
        <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
          <option>Monthly</option>
          <option>Weekly</option>
          <option>Yearly</option>
        </select>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="relative -mt-32 mb-20">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{totalSales}</div>
              <div className="text-sm text-gray-600">Referrals</div>
            </div>
          </div>
          
          <div className="w-full space-y-2 mt-4">
            {data.map((item, index) => (
              <div key={item.specialty} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700">{item.specialty}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

