import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, Image, Save } from 'lucide-react'

interface GalleryHeroSettings {
  background_image: string
  title: string
  subtitle: string
}

export const GalleryHeroManagement = () => {
  const { toast } = useToast()
  const [settings, setSettings] = useState<GalleryHeroSettings>({
    background_image: '',
    title: 'Gallery',
    subtitle: 'Explore our beautiful moments'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
        .upsert({
          setting_key: 'gallery_hero_background',
          setting_value: settings as any
        })

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
        {/* Background Image Preview */}
        <div className="space-y-2">
          <Label>Current Background</Label>
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
          </div>
        </div>

        {/* Background Image URL */}
        <div className="space-y-2">
          <Label htmlFor="background_image">Background Image URL</Label>
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