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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400" />
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  )
}
