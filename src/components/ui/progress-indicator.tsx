
import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  steps: string[]
  currentStep: number
  className?: string
}

export const ProgressIndicator = ({ steps, currentStep, className }: ProgressIndicatorProps) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                index < currentStep
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-500'
              )}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2 transition-all duration-300',
                  index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">{steps[currentStep]}</p>
        <p className="text-xs text-gray-500">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>
    </div>
  )
}
