import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, Image, Save, Upload, X } from 'lucide-react'

interface GalleryHeroSettings {
  background_image: string
  title: string
  subtitle: string
}

export const GalleryHeroManagement = () => {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [settings, setSettings] = useState<GalleryHeroSettings>({
    background_image: '',
    title: 'Gallery',
    subtitle: 'Explore our beautiful moments'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchGalleryHeroSettings()
  }, [])

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
        setSettings(data.setting_value as any)
      }
    } catch (error) {
      console.error('Error fetching gallery hero settings:', error)
      toast({
        title: "Error",
        description: "Failed to load gallery hero settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const { error } = await supabase
        .from('site_settings')
        .update({
          setting_value: settings as any
        })
        .eq('setting_key', 'gallery_hero_background')

      if (error) throw error

      toast({
        title: "Success",
        description: "Gallery hero settings updated successfully"
      })
    } catch (error) {
      console.error('Error saving gallery hero settings:', error)
      toast({
        title: "Error",
        description: "Failed to save gallery hero settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof GalleryHeroSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 5MB",
          variant: "destructive"
        })
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive"
        })
        return
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `gallery-hero-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('gallery-hero-images')
        .upload(fileName, file)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery-hero-images')
        .getPublicUrl(fileName)

      // Update settings with new image URL
      setSettings(prev => ({
        ...prev,
        background_image: publicUrl
      }))

      toast({
        title: "Success",
        description: "Background image uploaded successfully"
      })

    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const removeCurrentImage = () => {
    setSettings(prev => ({
      ...prev,
      background_image: ''
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image className="w-5 h-5" />
            <span>Gallery Hero Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Image className="w-5 h-5" />
          <span>Gallery Hero Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Background Image Upload */}
        <div className="space-y-4">
          <Label>Background Image</Label>
          
          {settings.background_image ? (
            <div className="space-y-2">
              <div className="relative h-32 rounded-lg overflow-hidden border">
                <img 
                  src={settings.background_image} 
                  alt="Gallery hero background"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-forest/80 to-primary/40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-2xl font-bold">{settings.title}</h2>
                    {settings.subtitle && (
                      <p className="text-white/90">{settings.subtitle}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeCurrentImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No background image selected</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 w-4 h-4" />
                  Upload New Image
                </>
              )}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Manual URL Input (fallback) */}
        <div className="space-y-2">
          <Label htmlFor="background_image">Or enter image URL manually</Label>
          <Input
            id="background_image"
            value={settings.background_image}
            onChange={(e) => handleInputChange('background_image', e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={settings.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Gallery"
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Textarea
            id="subtitle"
            value={settings.subtitle}
            onChange={(e) => handleInputChange('subtitle', e.target.value)}
            placeholder="Explore our beautiful moments"
            rows={3}
          />
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 w-4 h-4" />
              Save Gallery Hero Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}