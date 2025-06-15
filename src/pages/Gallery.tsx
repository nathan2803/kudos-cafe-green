import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { GalleryUploadModal } from '@/components/gallery/GalleryUploadModal'
import { 
  Camera, 
  Heart,
  Share2,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  Trash2
} from 'lucide-react'

interface GalleryImage {
  id: string
  title: string
  description?: string
  image_url: string
  category: 'food' | 'interior' | 'customers' | 'events'
  is_featured: boolean
  likes_count: number
  created_at: string
}

export const Gallery = () => {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null)
  const [galleryHeroSettings, setGalleryHeroSettings] = useState<any>(null)

  const categories = [
    { id: 'all', name: 'All Photos', count: 0 },
    { id: 'food', name: 'Our Dishes', count: 0 },
    { id: 'interior', name: 'Restaurant', count: 0 },
    { id: 'customers', name: 'Happy Customers', count: 0 },
    { id: 'events', name: 'Events', count: 0 }
  ]

  // Fetch gallery images from Supabase
  const fetchImages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Type assertion to ensure data matches our interface
      const typedData = (data || []) as GalleryImage[]
      setImages(typedData)
      setFilteredImages(typedData)
    } catch (error) {
      console.error('Error fetching gallery images:', error)
      toast({
        title: "Error",
        description: "Failed to load gallery images",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchGalleryHeroSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'gallery_hero_background')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data?.setting_value) {
        setGalleryHeroSettings(data.setting_value)
      }
    } catch (error) {
      console.error('Error fetching gallery hero settings:', error)
    }
  }

  useEffect(() => {
    fetchImages()
    fetchGalleryHeroSettings()

    // Set up real-time subscription
    const channel = supabase
      .channel('gallery-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gallery_images'
        },
        () => {
          fetchImages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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
      const image = images.find(img => img.id === imageId)
      if (!image) return

      const { error } = await supabase
        .from('gallery_images')
        .update({ likes_count: image.likes_count + 1 })
        .eq('id', imageId)

      if (error) throw error

      // Update local state immediately for better UX
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, likes_count: img.likes_count + 1 } : img
      ))

      toast({
        title: "Liked!",
        description: "Thanks for liking this photo"
      })
    } catch (error) {
      console.error('Error liking image:', error)
      toast({
        title: "Error",
        description: "Failed to like image",
        variant: "destructive"
      })
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    try {
      const image = images.find(img => img.id === imageId)
      if (!image) return

      // Optimistically update UI first
      setImages(prev => prev.filter(img => img.id !== imageId))

      // Check if this is a Supabase storage URL or external URL
      const isSupabaseStorage = image.image_url.includes('zuawgikivwqvkdxbqdyj.supabase.co/storage/v1/object/public/gallery-images/')
      
      if (isSupabaseStorage) {
        // Extract filename from Supabase storage URL
        const urlParts = image.image_url.split('/')
        const fileName = urlParts[urlParts.length - 1]

        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('gallery-images')
          .remove([fileName])

        if (storageError) {
          console.warn('Storage deletion failed:', storageError)
          // Continue with database deletion even if storage fails
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId)

      if (dbError) {
        // Revert optimistic update on error
        fetchImages()
        throw dbError
      }

      toast({
        title: "Image Deleted",
        description: "The image has been removed from the gallery"
      })

      setDeleteImageId(null)
    } catch (error) {
      console.error('Error deleting image:', error)
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header with Background Image */}
      <section 
        className="relative py-12 min-h-[300px] flex items-center justify-center"
        style={{
          backgroundImage: `url(${galleryHeroSettings?.background_image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-forest/80 via-forest/60 to-primary/40" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {galleryHeroSettings?.title || 'Gallery'}
          </h1>
          
          {galleryHeroSettings?.subtitle && (
            <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              {galleryHeroSettings.subtitle}
            </p>
          )}
          
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
            <Button 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={() => setUploadModalOpen(true)}
            >
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
                    
                     {/* Admin Delete Button */}
                     {isAdmin && (
                       <button
                         className="absolute top-2 right-2 bg-destructive/80 text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-destructive z-10"
                         onClick={(e) => {
                           e.stopPropagation()
                           setDeleteImageId(image.id)
                         }}
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     )}

                     {/* Overlay */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-2">{image.title}</h3>
                      {image.description && (
                        <p className="text-sm text-white/80 mb-3 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{image.description}</p>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Badge 
                            className="bg-primary/80 text-primary-foreground capitalize text-xs"
                          >
                            {image.category}
                          </Badge>
                          {image.is_featured && (
                            <Badge 
                              className="bg-accent/80 text-accent-foreground text-xs"
                            >
                              Featured
                            </Badge>
                          )}
                        </div>
                        
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

      {/* Upload Modal */}
      <GalleryUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadComplete={fetchImages}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteImageId} onOpenChange={() => setDeleteImageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteImageId && handleDeleteImage(deleteImageId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Gallery