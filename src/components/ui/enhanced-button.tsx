
import React from 'react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils'

interface EnhancedButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  tooltip?: string
}

export const EnhancedButton = ({ 
  loading = false, 
  loadingText = 'Loading...', 
  icon,
  tooltip,
  children, 
  className,
  disabled,
  ...props 
}: EnhancedButtonProps) => {
  return (
    <div className="relative group">
      <Button
        {...props}
        disabled={disabled || loading}
        className={cn(
          'transition-all duration-200 transform active:scale-95',
          loading && 'cursor-not-allowed',
          className
        )}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            {loadingText}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {icon}
            {children}
          </div>
        )}
      </Button>
      
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {tooltip}
        </div>
      )}
    </div>
  )
}
