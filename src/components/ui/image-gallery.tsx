import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  alt?: string
  className?: string
}

export const ImageGallery = ({ images, alt = "Gallery image", className = "" }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (!images || images.length === 0) return null

  const openGallery = (index: number) => {
    setSelectedIndex(index)
  }

  const closeGallery = () => {
    setSelectedIndex(null)
  }

  const nextImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selectedIndex === null) return
    
    switch (e.key) {
      case 'ArrowLeft':
        prevImage()
        break
      case 'ArrowRight':
        nextImage()
        break
      case 'Escape':
        closeGallery()
        break
    }
  }

  // Single image display
  if (images.length === 1) {
    return (
      <>
        <div 
          className={`relative cursor-pointer rounded-lg overflow-hidden ${className}`}
          onClick={() => openGallery(0)}
        >
          <img
            src={images[0]}
            alt={alt}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
        </div>

        <Dialog open={selectedIndex !== null} onOpenChange={closeGallery}>
          <DialogContent className="max-w-4xl p-0 bg-black/90 border-none">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={closeGallery}
              >
                <X className="w-4 h-4" />
              </Button>
              <img
                src={images[0]}
                alt={alt}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Multiple images grid
  const mainImage = images[0]
  const remainingImages = images.slice(1)

  return (
    <>
      <div className={`grid gap-2 ${className}`}>
        {/* Main image */}
        <div 
          className="relative cursor-pointer rounded-lg overflow-hidden col-span-2 row-span-2"
          onClick={() => openGallery(0)}
        >
          <img
            src={mainImage}
            alt={`${alt} 1`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Thumbnail grid */}
        <div className="grid grid-cols-2 gap-2">
          {remainingImages.slice(0, 3).map((image, index) => (
            <div
              key={index + 1}
              className="relative cursor-pointer rounded-lg overflow-hidden aspect-square"
              onClick={() => openGallery(index + 1)}
            >
              <img
                src={image}
                alt={`${alt} ${index + 2}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
              {/* Show +X more overlay on last thumbnail if there are more images */}
              {index === 2 && remainingImages.length > 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-medium">
                    +{remainingImages.length - 3} more
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Gallery Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeGallery}>
        <DialogContent 
          className="max-w-7xl p-0 bg-black/95 border-none"
          onKeyDown={handleKeyDown}
        >
          <div className="relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={closeGallery}
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Main image */}
            {selectedIndex !== null && (
              <img
                src={images[selectedIndex]}
                alt={`${alt} ${selectedIndex + 1}`}
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            )}

            {/* Image counter */}
            {images.length > 1 && selectedIndex !== null && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-black/60 p-2 rounded-lg max-w-md overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-colors ${
                      selectedIndex === index ? 'border-white' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}