import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { 
  Camera, 
  Heart,
  Share2,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Upload
} from 'lucide-react'

interface GalleryImage {
  id: string
  title: string
  description?: string
  image_url: string
  category: 'food' | 'interior' | 'customers' | 'events'
  uploaded_by?: string
  is_featured: boolean
  likes_count: number
  created_at: string
  updated_at: string
}

export const Gallery = () => {
  const { user, isAdmin } = useAuth()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const categories = [
    { id: 'all', name: 'All Photos', count: 0 },
    { id: 'food', name: 'Our Dishes', count: 0 },
    { id: 'interior', name: 'Restaurant', count: 0 },
    { id: 'customers', name: 'Happy Customers', count: 0 },
    { id: 'events', name: 'Events', count: 0 }
  ]

  // Fetch images from Supabase
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching images:', error)
          return
        }

        // Type-cast the data to ensure proper typing
        const typedData = (data || []) as GalleryImage[]
        setImages(typedData)
        setFilteredImages(typedData)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredImages(images)
    } else {
      setFilteredImages(images.filter(img => img.category === selectedCategory))
    }
  }, [selectedCategory, images])

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return images.length
    return images.filter(img => img.category === categoryId).length
  }

  const openImageModal = (image: GalleryImage) => {
    setSelectedImage(image)
    setCurrentImageIndex(filteredImages.findIndex(img => img.id === image.id))
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    let newIndex = currentImageIndex
    if (direction === 'prev') {
      newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : filteredImages.length - 1
    } else {
      newIndex = currentImageIndex < filteredImages.length - 1 ? currentImageIndex + 1 : 0
    }
    setCurrentImageIndex(newIndex)
    setSelectedImage(filteredImages[newIndex])
  }

  const handleLike = async (imageId: string) => {
    try {
      // Optimistically update UI
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, likes_count: img.likes_count + 1 } : img
      ))

      // Update in database
      const image = images.find(img => img.id === imageId)
      if (image) {
        const { error } = await supabase
          .from('gallery_images')
          .update({ likes_count: image.likes_count + 1 })
          .eq('id', imageId)

        if (error) {
          console.error('Error updating likes:', error)
          // Revert optimistic update
          setImages(prev => prev.map(img => 
            img.id === imageId ? { ...img, likes_count: img.likes_count - 1 } : img
          ))
        }
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <section className="relative py-12 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Gallery
          </h1>
          
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id 
                    ? 'bg-primary-foreground text-primary shadow-lg' 
                    : 'bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30'
                }`}
              >
                {category.name} ({getCategoryCount(category.id)})
              </button>
            ))}
          </div>

          {isAdmin && (
            <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Upload className="mr-2 w-4 h-4" />
              Upload Photos
            </Button>
          )}
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="break-inside-avoid mb-4">
                  <div className="rounded-xl overflow-hidden bg-muted">
                    <div className="h-64 bg-muted animate-pulse" />
                    <div className="p-3">
                      <div className="h-4 bg-muted-foreground/20 rounded animate-pulse mb-2" />
                      <div className="h-3 bg-muted-foreground/20 rounded animate-pulse w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4">
              {filteredImages.map((image) => (
                <div 
                  key={image.id} 
                  className="break-inside-avoid mb-4 cursor-pointer group"
                  onClick={() => openImageModal(image)}
                >
                  <div className="relative overflow-hidden rounded-xl bg-card shadow-sm hover:shadow-xl transition-all duration-300 border border-border/10">
                    <img 
                      src={image.image_url}
                      alt={image.title}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-2">{image.title}</h3>
                      {image.description && (
                        <p className="text-sm text-white/80 mb-3 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{image.description}</p>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <Badge 
                          className="bg-primary/80 text-primary-foreground capitalize text-xs"
                        >
                          {image.category}
                        </Badge>
                        
                        <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLike(image.id)
                            }}
                          >
                            <Heart className="w-4 h-4" />
                            <span className="text-sm">{image.likes_count}</span>
                          </button>
                          <button
                            className="text-white/80 hover:text-white transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredImages.length === 0 && !loading && (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No photos found</h3>
              <p className="text-muted-foreground">Try selecting a different category or check back later.</p>
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black/95 border-none">
          <DialogTitle className="sr-only">Gallery Image</DialogTitle>
          {selectedImage && (
            <div className="relative">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Navigation Buttons */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={() => navigateImage('prev')}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={() => navigateImage('next')}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>

              {/* Image */}
              <img 
                src={selectedImage.image_url}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />

              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{selectedImage.title}</h3>
                    {selectedImage.description && (
                      <p className="text-white/80 mb-2">{selectedImage.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <span>{new Date(selectedImage.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{selectedImage.likes_count} likes</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                      onClick={() => handleLike(selectedImage.id)}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Like
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Gallery