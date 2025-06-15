import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'

interface GalleryUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete: () => void
}

interface ImageUpload {
  file: File
  preview: string
  title: string
  description: string
  category: 'food' | 'interior' | 'customers' | 'events'
  isFeatured: boolean
}

export const GalleryUploadModal = ({ open, onOpenChange, onUploadComplete }: GalleryUploadModalProps) => {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<ImageUpload[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const categories = [
    { value: 'food', label: 'Our Dishes' },
    { value: 'interior', label: 'Restaurant Interior' },
    { value: 'customers', label: 'Happy Customers' },
    { value: 'events', label: 'Events' }
  ]

  const handleFileSelect = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage: ImageUpload = {
          file,
          preview: e.target?.result as string,
          title: file.name.replace(/\.[^/.]+$/, ""),
          description: '',
          category: 'food',
          isFeatured: false
        }
        setImages(prev => [...prev, newImage])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    handleFileSelect(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const updateImage = (index: number, updates: Partial<ImageUpload>) => {
    setImages(prev => prev.map((img, i) => i === index ? { ...img, ...updates } : img))
  }

  const resizeImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(resolve, 'image/jpeg', quality)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const uploadImages = async () => {
    if (images.length === 0) return

    setUploading(true)
    let successCount = 0

    try {
      for (const image of images) {
        // Resize image for web optimization
        const resizedBlob = await resizeImage(image.file)
        
        // Generate unique filename
        const fileExt = image.file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gallery-images')
          .upload(fileName, resizedBlob!)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('gallery-images')
          .getPublicUrl(fileName)

        // Save to database
        const { error: dbError } = await supabase
          .from('gallery_images')
          .insert({
            title: image.title,
            description: image.description || null,
            image_url: publicUrl,
            category: image.category,
            is_featured: image.isFeatured,
            uploaded_by: (await supabase.auth.getUser()).data.user?.id
          })

        if (dbError) throw dbError
        successCount++
      }

      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${successCount} image${successCount > 1 ? 's' : ''}`
      })

      setImages([])
      onUploadComplete()
      onOpenChange(false)

    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Failed",
        description: "Some images failed to upload. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Upload Gallery Images</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(Array.from(e.target.files || []))}
              className="hidden"
            />
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Drop images here or click to select</p>
            <p className="text-sm text-muted-foreground">Support JPG, PNG, WebP formats</p>
          </div>

          {/* Image List */}
          {images.length > 0 && (
            <div className="max-h-96 overflow-y-auto space-y-4">
              {images.map((image, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex gap-4">
                    {/* Image Preview */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img
                        src={image.preview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Image Details */}
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`title-${index}`}>Title</Label>
                          <Input
                            id={`title-${index}`}
                            value={image.title}
                            onChange={(e) => updateImage(index, { title: e.target.value })}
                            placeholder="Image title"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`category-${index}`}>Category</Label>
                          <Select
                            value={image.category}
                            onValueChange={(value) => updateImage(index, { category: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`description-${index}`}>Description</Label>
                        <Textarea
                          id={`description-${index}`}
                          value={image.description}
                          onChange={(e) => updateImage(index, { description: e.target.value })}
                          placeholder="Optional description"
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`featured-${index}`}
                          checked={image.isFeatured}
                          onCheckedChange={(checked) => updateImage(index, { isFeatured: !!checked })}
                        />
                        <Label htmlFor={`featured-${index}`}>Featured image</Label>
                        {image.isFeatured && (
                          <Badge variant="secondary">Featured</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={uploadImages}
              disabled={images.length === 0 || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {images.length} Image{images.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}