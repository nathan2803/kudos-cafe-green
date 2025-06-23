
import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, AlertTriangle, Bell, X } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationToastProps {
  type: NotificationType
  title: string
  message?: string
  duration?: number
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Bell
}

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
}

export const NotificationToast = ({
  type,
  title,
  message,
  duration = 5000,
  onDismiss,
  action
}: NotificationToastProps) => {
  const [isVisible, setIsVisible] = useState(true)
  const Icon = iconMap[type]

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onDismiss?.(), 300)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onDismiss])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed top-4 right-4 max-w-sm w-full p-4 border rounded-lg shadow-lg transition-all duration-300 z-50',
        colorMap[type],
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{title}</h4>
          {message && (
            <p className="mt-1 text-sm opacity-90">{message}</p>
          )}
          
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onDismiss?.(), 300)
          }}
          className="flex-shrink-0 p-1 hover:bg-black/10 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
