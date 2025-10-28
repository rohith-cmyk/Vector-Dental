import { ReactNode } from 'react'
import { Card, CardContent } from './Card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon?: ReactNode
  className?: string
}

export function StatCard({ title, value, change, icon, className }: StatCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0
  
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            {icon && <span className="text-gray-400">{icon}</span>}
            <span>{title}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change !== undefined && (
              <span className={cn(
                'text-sm font-medium',
                isPositive && 'text-green-600',
                isNegative && 'text-red-600',
                !isPositive && !isNegative && 'text-gray-600'
              )}>
                {isPositive && '↑'}{isNegative && '↓'} {Math.abs(change)}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

