import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { ImageIcon, Upload } from 'lucide-react'

interface MenuHeroSettings {
  title: string
  subtitle: string
  button_text: string
  background_image: string
  overlay_opacity: number
  overlay_color: string
}

export const MenuHeroManagement = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [heroSettings, setHeroSettings] = useState<MenuHeroSettings>({
    title: 'Our Green Menu',
    subtitle: 'Discover our carefully crafted dishes made with locally sourced, organic ingredients. Each meal is prepared with love for both your taste buds and the environment.',
    button_text: 'Explore Menu',
    background_image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop',
    overlay_opacity: 0.6,
    overlay_color: '#000000'
  })

  useEffect(() => {
    fetchHeroSettings()
  }, [])

  const fetchHeroSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'menu_hero')
        .maybeSingle()

      if (error) throw error
      
      if (data) {
        const settings = data.setting_value as unknown as MenuHeroSettings
        setHeroSettings(settings)
        setImagePreview(settings.background_image)
      }
    } catch (error: any) {
      console.error('Error fetching hero settings:', error)
      toast({
        title: "Error",
        description: "Failed to load hero settings",
        variant: "destructive"
      })
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `hero-${Date.now()}.${fileExt}`
      const filePath = `menu-hero/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      })
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveHeroSettings = async () => {
    console.log('Starting save hero settings...')
    console.log('Current hero settings:', heroSettings)
    setLoading(true)
    try {
      let backgroundImage = heroSettings.background_image

      // Upload new image if selected
      if (selectedImage) {
        console.log('Uploading new image...')
        const uploadedUrl = await uploadImage(selectedImage)
        if (uploadedUrl) {
          backgroundImage = uploadedUrl
        }
      }

      const updatedSettings = {
        ...heroSettings,
        background_image: backgroundImage
      }

      console.log('Attempting to save settings:', updatedSettings)

      const { error } = await supabase
        .from('site_settings')
        .update({
          setting_value: updatedSettings
        })
        .eq('setting_key', 'menu_hero')

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Settings saved successfully')
      setHeroSettings(updatedSettings)
      setSelectedImage(null)
      
      toast({
        title: "Success",
        description: "Hero section settings saved successfully",
      })
    } catch (error: any) {
      console.error('Error saving hero settings:', error)
      toast({
        title: "Error",
        description: `Failed to save hero settings: ${error.message}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Menu Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Background Image */}
          <div className="space-y-4">
            <Label>Background Image</Label>
            <div className="flex gap-6">
              <div className="w-64 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Background preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
                {uploading && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Upload className="w-4 h-4 animate-spin" />
                    Uploading...
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Upload a high-quality image (1200x600px recommended)
                </p>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Hero Title</Label>
              <Input
                id="title"
                value={heroSettings.title}
                onChange={(e) => setHeroSettings(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Our Green Menu"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={heroSettings.subtitle}
                onChange={(e) => setHeroSettings(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Discover our carefully crafted dishes..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="button_text">Button Text</Label>
              <Input
                id="button_text"
                value={heroSettings.button_text}
                onChange={(e) => setHeroSettings(prev => ({ ...prev, button_text: e.target.value }))}
                placeholder="Explore Menu"
              />
            </div>
          </div>

          {/* Overlay Settings */}
          <div className="space-y-4">
            <Label>Background Overlay</Label>
            
            <div className="space-y-2">
              <Label htmlFor="overlay_color">Overlay Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="overlay_color"
                  type="color"
                  value={heroSettings.overlay_color}
                  onChange={(e) => setHeroSettings(prev => ({ ...prev, overlay_color: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={heroSettings.overlay_color}
                  onChange={(e) => setHeroSettings(prev => ({ ...prev, overlay_color: e.target.value }))}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Overlay Opacity: {Math.round(heroSettings.overlay_opacity * 100)}%</Label>
              <Slider
                value={[heroSettings.overlay_opacity]}
                onValueChange={(values) => setHeroSettings(prev => ({ ...prev, overlay_opacity: values[0] }))}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div 
              className="relative h-32 rounded-lg overflow-hidden flex items-center justify-center text-white"
              style={{
                backgroundImage: `url(${imagePreview || heroSettings.background_image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div 
                className="absolute inset-0"
                style={{
                  backgroundColor: heroSettings.overlay_color,
                  opacity: heroSettings.overlay_opacity
                }}
              />
              <div className="relative z-10 text-center p-4">
                <h3 className="text-lg font-bold mb-1">{heroSettings.title}</h3>
                <p className="text-sm opacity-90 mb-2 line-clamp-2">{heroSettings.subtitle}</p>
                <Button size="sm" variant="secondary">
                  {heroSettings.button_text}
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={saveHeroSettings}
            disabled={loading || uploading}
            className="w-full"
          >
            {loading ? 'Saving...' : 'Save Hero Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}