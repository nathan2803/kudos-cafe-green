
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
