
import React, { useState, forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

interface EnhancedInputProps extends React.ComponentProps<typeof Input> {
  label?: string
  error?: string
  success?: string
  hint?: string
  showPasswordToggle?: boolean
  icon?: React.ReactNode
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    label, 
    error, 
    success, 
    hint, 
    showPasswordToggle = false, 
    icon, 
    className, 
    type: initialType = 'text',
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    
    const type = showPasswordToggle && showPassword ? 'text' : initialType

    return (
      <div className="space-y-2">
        {label && (
          <Label 
            htmlFor={props.id} 
            className={cn(
              'transition-colors duration-200',
              error ? 'text-red-600' : success ? 'text-green-600' : 'text-gray-700',
              isFocused && !error && !success && 'text-primary'
            )}
          >
            {label}
          </Label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <Input
            {...props}
            ref={ref}
            type={type}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            className={cn(
              'transition-all duration-200',
              icon && 'pl-10',
              showPasswordToggle && 'pr-10',
              error && 'border-red-500 focus:border-red-500',
              success && 'border-green-500 focus:border-green-500',
              isFocused && !error && !success && 'ring-2 ring-primary/20',
              className
            )}
          />
          
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          
          {error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
              <AlertCircle size={16} />
            </div>
          )}
          
          {success && !error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
              <CheckCircle size={16} />
            </div>
          )}
        </div>
        
        {(error || success || hint) && (
          <div className="text-sm">
            {error && (
              <p className="text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
            {success && !error && (
              <p className="text-green-600 flex items-center gap-1">
                <CheckCircle size={14} />
                {success}
              </p>
            )}
            {hint && !error && !success && (
              <p className="text-gray-500">{hint}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = 'EnhancedInput'
