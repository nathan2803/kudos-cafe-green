import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { 
  Camera, 
  Plus, 
  Filter, 
  Grid3X3, 
  List,
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
  url: string
  title: string
  category: 'food' | 'interior' | 'customers' | 'events'
  description?: string
  uploadedBy?: string
  uploadedAt: string
  likes: number
}

export const Gallery = () => {
  const { user, isAdmin } = useAuth()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry')
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

  // Sample gallery data with varying aspect ratios for masonry layout
  const sampleImages: GalleryImage[] = [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=600',
      title: 'Signature Green Salad',
      category: 'food',
      description: 'Fresh organic greens with our house-made vinaigrette',
      uploadedAt: '2024-01-15',
      likes: 42
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300',
      title: 'Artisanal Pasta',
      category: 'food',
      description: 'Handmade pasta with seasonal vegetables',
      uploadedAt: '2024-01-14',
      likes: 38
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=500',
      title: 'Restaurant Interior',
      category: 'interior',
      description: 'Our warm and inviting dining space',
      uploadedAt: '2024-01-13',
      likes: 29
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=700',
      title: 'Farm Fresh Ingredients',
      category: 'food',
      description: 'Locally sourced organic produce',
      uploadedAt: '2024-01-12',
      likes: 55
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1571197200840-ca4a3e07e1f8?w=400&h=350',
      title: 'Kitchen in Action',
      category: 'interior',
      description: 'Our chefs preparing fresh meals',
      uploadedAt: '2024-01-11',
      likes: 33
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1529417305485-480f579e3fdd?w=400&h=600',
      title: 'Happy Customers',
      category: 'customers',
      description: 'Guests enjoying their sustainable dining experience',
      uploadedAt: '2024-01-10',
      likes: 47
    },
    {
      id: '7',
      url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400',
      title: 'Eco-Friendly Setup',
      category: 'events',
      description: 'Special sustainability event setup',
      uploadedAt: '2024-01-09',
      likes: 31
    },
    {
      id: '8',
      url: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&h=550',
      title: 'Gourmet Dessert',
      category: 'food',
      description: 'House-made dessert with organic ingredients',
      uploadedAt: '2024-01-08',
      likes: 41
    },
    {
      id: '9',
      url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=320',
      title: 'Green Dining Area',
      category: 'interior',
      description: 'Our signature green-themed dining space',
      uploadedAt: '2024-01-07',
      likes: 36
    },
    {
      id: '10',
      url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=650',
      title: 'Chef Special',
      category: 'food',
      description: 'Today\'s special creation by our head chef',
      uploadedAt: '2024-01-06',
      likes: 28
    },
    {
      id: '11',
      url: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400&h=250',
      title: 'Cozy Corner',
      category: 'interior',
      description: 'Perfect spot for intimate dining',
      uploadedAt: '2024-01-05',
      likes: 35
    },
    {
      id: '12',
      url: 'https://images.unsplash.com/photo-1528712306091-ed0763094c98?w=400&h=580',
      title: 'Organic Harvest',
      category: 'food',
      description: 'Fresh seasonal vegetables from local farms',
      uploadedAt: '2024-01-04',
      likes: 52
    }
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setImages(sampleImages)
      setFilteredImages(sampleImages)
      setLoading(false)
    }, 1000)
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

  const handleLike = (imageId: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, likes: img.likes + 1 } : img
    ))
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
                      src={image.url}
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
                            <span className="text-sm">{image.likes}</span>
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
                src={selectedImage.url}
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
                      <span>{new Date(selectedImage.uploadedAt).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{selectedImage.likes} likes</span>
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