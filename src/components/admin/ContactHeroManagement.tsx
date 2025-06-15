import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { HeroImageUpload } from './HeroImageUpload'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Save, Eye, Upload } from 'lucide-react'

interface ContactHeroSettings {
  title: string
  subtitle: string
  background_image: string
  overlay_opacity: number
  overlay_color: string
}

export const ContactHeroManagement = () => {
  const { toast } = useToast()
  const [settings, setSettings] = useState<ContactHeroSettings>({
    title: 'Contact Us',
    subtitle: "We'd love to hear from you. Get in touch with Kudos Cafe & Restaurant.",
    background_image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=600&fit=crop',
    overlay_opacity: 0.6,
    overlay_color: '#2D5016'
  })
  const [loading, setLoading] = useState(false)
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'contact_hero')
        .maybeSingle()

      if (error) throw error
      
      if (data?.setting_value) {
        setSettings(data.setting_value as unknown as ContactHeroSettings)
      }
    } catch (error) {
      console.error('Error fetching contact hero settings:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: 'contact_hero',
          setting_value: settings as any
        })

      if (error) throw error

      toast({
        title: "Settings saved",
        description: "Contact hero settings have been updated successfully.",
      })
    } catch (error) {
      console.error('Error saving contact hero settings:', error)
      toast({
        title: "Error",
        description: "Failed to save contact hero settings.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImagesChange = (images: string[]) => {
    setHeroImages(images)
    if (images.length > 0) {
      setSettings(prev => ({
        ...prev,
        background_image: images[0] // Use the first uploaded image
      }))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Contact Hero Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Background Image */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Background Image</Label>
            
            {/* Current Background Preview */}
            <div 
              className="w-full h-40 rounded-lg bg-cover bg-center relative overflow-hidden"
              style={{
                backgroundImage: `url(${settings.background_image})`,
              }}
            >
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  backgroundColor: settings.overlay_color,
                  opacity: settings.overlay_opacity
                }}
              >
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold">{settings.title}</h3>
                  <p className="text-lg mt-2">{settings.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowUpload(!showUpload)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {showUpload ? 'Hide Upload' : 'Upload New Image'}
              </Button>
              <Input
                placeholder="Or paste image URL here"
                value={settings.background_image}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  background_image: e.target.value
                }))}
                className="flex-1"
              />
            </div>
          </div>

          {/* Upload Section */}
          {showUpload && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Upload Background Image</Label>
              <HeroImageUpload
                images={heroImages}
                onImagesChange={handleImagesChange}
                maxImages={1}
              />
            </div>
          )}

          {/* Text Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={settings.title}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                placeholder="Contact Us"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              value={settings.subtitle}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                subtitle: e.target.value
              }))}
              placeholder="Enter subtitle text"
              rows={3}
            />
          </div>

          {/* Overlay Settings */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Overlay Settings</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="overlay_color">Overlay Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="overlay_color"
                    type="color"
                    value={settings.overlay_color}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      overlay_color: e.target.value
                    }))}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={settings.overlay_color}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      overlay_color: e.target.value
                    }))}
                    placeholder="#2D5016"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Overlay Opacity: {Math.round(settings.overlay_opacity * 100)}%</Label>
                <Slider
                  value={[settings.overlay_opacity]}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    overlay_opacity: value[0]
                  }))}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}