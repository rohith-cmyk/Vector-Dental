import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-gray-100 text-black/25',
      success: 'bg-green-100 text-green-500',
      warning: 'bg-yellow-100 text-yellow-500',
      danger: 'bg-red-100 text-red-500',
      info: 'bg-blue-100 text-blue-500',
    }
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold tracking',
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

