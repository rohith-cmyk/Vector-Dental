'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

interface BreakdownData {
  category: string
  count: number
  percentage: number
}

interface BreakdownChartProps {
  title?: string
  data: BreakdownData[]
  categoryKey?: keyof BreakdownData
  displayKey?: keyof BreakdownData
}

const COLORS = [
  '#10b981',
  '#60a5fa',
  '#f87171',
  '#f59e0b',
  '#8b5cf6',
  '#14b8a6',
  '#22c55e',
]

export function BreakdownChart({
  data,
  title = 'Referrals Breakdown',
  categoryKey = 'category',
  displayKey = 'category',
}: BreakdownChartProps) {
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly')
  const safeData = (data || []).slice(0, 5)

  const chartData = safeData.map((item) => ({
    name: item[displayKey] || item.category,
    value: item.count,
  }))

  const totalCount = safeData.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <select
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          value={period}
          onChange={(event) => setPeriod(event.target.value as 'monthly' | 'weekly' | 'yearly')}
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="yearly">Yearly</option>
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
                  <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="relative -mt-32 mb-20">
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-700">{totalCount}</div>
              <div className="text-sm text-neutral-500">Referrals</div>
            </div>
          </div>

          <div className="w-full space-y-2 mt-4">
            {safeData.length > 0 ? (
              safeData.map((item, index) => (
                <div key={item[categoryKey] || item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-neutral-700">{item[displayKey] || item.category}</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-700">{item.percentage}%</span>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-neutral-500 py-4">No data available</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

