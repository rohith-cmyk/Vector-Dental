import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[11px] font-semibold text-neutral-400 ml-1"
          >
            {label}
          </label>
        )}

        <div className="relative group">
          <style>{`
            select {
              color-scheme: light;
            }
            select option {
              background-color: #ffffff;
              color: #374151;
            }
          `}</style>
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full appearance-none rounded-xl py-2.5 pl-4 pr-10 text-sm transition-all outline-none',
              'bg-white border border-neutral-200 text-neutral-700 shadow-sm',
              'placeholder:text-neutral-400',
              'focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
              error && 'bg-red-50 border-red-200 text-red-600 focus:border-red-500 focus:ring-red-200',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown
              className={cn(
                "h-4 w-4 text-neutral-400 transition-transform duration-200",
                "group-focus-within:rotate-180 group-focus-within:text-emerald-600",
                error && "text-red-400"
              )}
            />
          </div>
        </div>

        {error && (
          <p className="ml-1 text-xs font-medium text-red-600 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
