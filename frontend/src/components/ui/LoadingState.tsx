import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  title?: string
  subtitle?: string
  className?: string
}

export function LoadingState({
  title = 'Loading...',
  subtitle,
  className,
}: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center gap-2', className)}>
      <div className="relative">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-sm" />
      </div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  )
}
