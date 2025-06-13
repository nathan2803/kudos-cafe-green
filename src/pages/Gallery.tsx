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

  // Sample gallery data - in real app, this would come from Supabase
  const sampleImages: GalleryImage[] = [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop',
      title: 'Signature Green Salad',
      category: 'food',
      description: 'Fresh organic greens with our house-made vinaigrette',
      uploadedAt: '2024-01-15',
      likes: 42
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=800&h=600&fit=crop',
      title: 'Artisanal Pasta',
      category: 'food',
      description: 'Handmade pasta with seasonal vegetables',
      uploadedAt: '2024-01-14',
      likes: 38
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      title: 'Restaurant Interior',
      category: 'interior',
      description: 'Our warm and inviting dining space',
      uploadedAt: '2024-01-13',
      likes: 29
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
      title: 'Farm Fresh Ingredients',
      category: 'food',
      description: 'Locally sourced organic produce',
      uploadedAt: '2024-01-12',
      likes: 55
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1571197200840-ca4a3e07e1f8?w=800&h=600&fit=crop',
      title: 'Kitchen in Action',
      category: 'interior',
      description: 'Our chefs preparing fresh meals',
      uploadedAt: '2024-01-11',
      likes: 33
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1529417305485-480f579e3fdd?w=800&h=600&fit=crop',
      title: 'Happy Customers',
      category: 'customers',
      description: 'Guests enjoying their sustainable dining experience',
      uploadedAt: '2024-01-10',
      likes: 47
    },
    {
      id: '7',
      url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
      title: 'Eco-Friendly Setup',
      category: 'events',
      description: 'Special sustainability event setup',
      uploadedAt: '2024-01-09',
      likes: 31
    },
    {
      id: '8',
      url: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&h=600&fit=crop',
      title: 'Gourmet Dessert',
      category: 'food',
      description: 'House-made dessert with organic ingredients',
      uploadedAt: '2024-01-08',
      likes: 41
    },
    {
      id: '9',
      url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
      title: 'Green Dining Area',
      category: 'interior',
      description: 'Our signature green-themed dining space',
      uploadedAt: '2024-01-07',
      likes: 36
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
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-forest via-primary to-medium-green text-cream">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-light-green/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Camera className="w-8 h-8 text-light-green" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Visual <span className="text-light-green">Journey</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-cream/90 max-w-2xl mx-auto">
            "A picture is worth a thousand flavors. Experience the beauty of sustainable dining 
            through our curated gallery of moments, meals, and memories."
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAdmin && (
              <Button size="lg" className="bg-light-green text-forest hover:bg-light-green/90">
                <Upload className="mr-2 w-5 h-5" />
                Upload Photos
              </Button>
            )}
            <Button 
              variant="outline" 
              size="lg"
              className="border-light-green text-light-green hover:bg-light-green hover:text-forest"
            >
              <Share2 className="mr-2 w-5 h-5" />
              Share Gallery
            </Button>
          </div>
        </div>
      </section>

      {/* Filter Controls */}
      <section className="py-8 bg-muted/30 border-b border-primary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`${
                    selectedCategory === category.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border-primary/20 text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Filter className="mr-2 w-4 h-4" />
                  {category.name}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {getCategoryCount(category.id)}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">View:</span>
              <Button
                variant={viewMode === 'grid' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="w-10 h-10 p-0"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'masonry' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('masonry')}
                className="w-10 h-10 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-64 bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'columns-1 md:columns-2 lg:columns-3 space-y-6'
            }`}>
              {filteredImages.map((image) => (
                <Card 
                  key={image.id} 
                  className={`overflow-hidden border-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer group ${
                    viewMode === 'masonry' ? 'break-inside-avoid' : ''
                  }`}
                  onClick={() => openImageModal(image)}
                >
                  <div className="relative">
                    <img 
                      src={image.url}
                      alt={image.title}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Overlay Actions */}
                    <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike(image.id)
                        }}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Category Badge */}
                    <Badge 
                      className="absolute top-4 left-4 bg-primary/90 text-primary-foreground capitalize"
                    >
                      {image.category}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{image.title}</h3>
                    {image.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{image.description}</p>
                    )}
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{new Date(image.uploadedAt).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{image.likes}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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