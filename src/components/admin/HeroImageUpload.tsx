import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

interface HeroImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  disabled?: boolean
}

export const HeroImageUpload = ({ 
  images, 
  onImagesChange, 
  maxImages = 10, 
  disabled = false
}: HeroImageUploadProps) => {
  const bucketName = "hero-images"
  const { user } = useAuth()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }
      
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image must be less than 10MB')
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }, [user])

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || !user || disabled) return

    if (images.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images`,
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map(uploadImage)
      const uploadedUrls = await Promise.all(uploadPromises)
      
      const validUrls = uploadedUrls.filter((url): url is string => url !== null)
      onImagesChange([...images, ...validUrls])
      
      toast({
        title: "Images uploaded",
        description: `${validUrls.length} image(s) uploaded successfully`
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }, [images, onImagesChange, maxImages, uploadImage, user, disabled, toast])

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }, [images, onImagesChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {images.length < maxImages && (
        <Card
          className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <label className="block p-6 cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={disabled || uploading}
            />
            <div className="text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                Drop hero images here or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WebP up to 10MB each ({images.length}/{maxImages})
              </p>
            </div>
          </label>
        </Card>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={imageUrl}
                  alt={`Hero image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <ImageIcon className="w-4 h-4 animate-pulse" />
          <span>Uploading hero images...</span>
        </div>
      )}
    </div>
  )
}