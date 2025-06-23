
import React, { useState, useEffect } from 'react'
import { useImageOptimization } from '@/hooks/useImageOptimization'

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string
  quality?: number
  lazy?: boolean
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  placeholder, 
  quality = 80, 
  lazy = true, 
  className,
  ...props 
}: OptimizedImageProps) => {
  const { imageSrc, isLoading, hasError } = useImageOptimization({ src, placeholder, quality })
  const [isInView, setIsInView] = useState(!lazy)

  useEffect(() => {
    if (!lazy) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    const element = document.querySelector(`[data-src="${src}"]`)
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [src, lazy])

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <img
      {...props}
      src={isInView ? imageSrc : placeholder}
      alt={alt}
      className={className}
      data-src={src}
      loading={lazy ? 'lazy' : 'eager'}
      style={{
        transition: 'opacity 0.3s ease',
        opacity: isLoading ? 0.7 : 1,
        ...props.style
      }}
    />
  )
}
