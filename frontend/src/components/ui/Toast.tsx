import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { XCircle, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info'

type ToastItem = {
  id: string
  title?: string
  message: string
  variant: ToastVariant
}

type ToastContextValue = {
  addToast: (toast: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const getIcon = (variant: ToastVariant) => {
  switch (variant) {
    case 'success':
      return CheckCircle
    case 'error':
      return XCircle
    default:
      return Info
  }
}

const getStyles = (variant: ToastVariant) => {
  switch (variant) {
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800'
    case 'error':
      return 'border-red-200 bg-red-50 text-red-700'
    default:
      return 'border-neutral-200 bg-white text-neutral-700'
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => removeToast(id), 4000)
  }, [removeToast])

  const value = useMemo(() => ({ addToast }), [addToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[60] space-y-3">
        {toasts.map((toast) => {
          const Icon = getIcon(toast.variant)
          return (
            <div
              key={toast.id}
              className={cn(
                'flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg max-w-sm',
                getStyles(toast.variant)
              )}
            >
              <Icon className="h-5 w-5 mt-0.5" />
              <div className="space-y-1">
                {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
                <div className="text-sm">{toast.message}</div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-auto text-neutral-400 hover:text-neutral-600"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
