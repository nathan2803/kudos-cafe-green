
import { useState, useEffect } from 'react'

interface UseImageOptimizationProps {
  src: string
  placeholder?: string
  quality?: number
}

export const useImageOptimization = ({ 
  src, 
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==',
  quality = 80 
}: UseImageOptimizationProps) => {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!src) return

    const img = new Image()
    img.onload = () => {
      setImageSrc(src)
      setIsLoading(false)
      setHasError(false)
    }
    img.onerror = () => {
      setIsLoading(false)
      setHasError(true)
    }
    img.src = src
  }, [src])

  return { imageSrc, isLoading, hasError }
}

// Optimized Image component with lazy loading
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
