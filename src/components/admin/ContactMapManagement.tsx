import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { HeroImageUpload } from './HeroImageUpload'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Save, Map, MapPin, Image } from 'lucide-react'

interface ContactMapSettings {
  map_enabled: boolean
  map_url: string
  location_title: string
  location_description: string
  use_static_image: boolean
  static_image_url: string
}

export const ContactMapManagement = () => {
  const { toast } = useToast()
  const [settings, setSettings] = useState<ContactMapSettings>({
    map_enabled: true,
    map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.9896893845524!2d120.97901237586563!3d14.553362285910577!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397ca21af3e5fb9%3A0x5cd7c85e46a4c5dd!2sSM%20Mall%20of%20Asia!5e0!3m2!1sen!2sph!4v1734276000000!5m2!1sen!2sph',
    location_title: 'Find Us',
    location_description: 'Located at SM Mall of Asia, Quezon',
    use_static_image: false,
    static_image_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [staticImages, setStaticImages] = useState<string[]>([])

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'contact_map')
        .maybeSingle()

      if (error) throw error
      
      if (data?.setting_value) {
        setSettings(data.setting_value as unknown as ContactMapSettings)
      }
    } catch (error) {
      console.error('Error fetching contact map settings:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: 'contact_map',
          setting_value: settings as any
        }, {
          onConflict: 'setting_key'
        })

      if (error) throw error

      toast({
        title: "Settings saved",
        description: "Contact map settings have been updated successfully.",
      })
    } catch (error) {
      console.error('Error saving contact map settings:', error)
      toast({
        title: "Error",
        description: "Failed to save contact map settings.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStaticImagesChange = (images: string[]) => {
    setStaticImages(images)
    if (images.length > 0) {
      setSettings(prev => ({
        ...prev,
        static_image_url: images[0]
      }))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Contact Map Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Map */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Enable Map Section</Label>
              <p className="text-sm text-muted-foreground">
                Toggle to show or hide the map section on the contact page
              </p>
            </div>
            <Switch
              checked={settings.map_enabled}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                map_enabled: checked
              }))}
            />
          </div>

          {settings.map_enabled && (
            <>
              {/* Section Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_title">Section Title</Label>
                  <Input
                    id="location_title"
                    value={settings.location_title}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      location_title: e.target.value
                    }))}
                    placeholder="Find Us"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_description">Section Description</Label>
                <Textarea
                  id="location_description"
                  value={settings.location_description}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    location_description: e.target.value
                  }))}
                  placeholder="Located at SM Mall of Asia, Quezon"
                  rows={2}
                />
              </div>

              {/* Map Type Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Map Display Type</Label>
                <RadioGroup
                  value={settings.use_static_image ? 'static' : 'interactive'}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    use_static_image: value === 'static'
                  }))}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="interactive" id="interactive" />
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <Label htmlFor="interactive" className="cursor-pointer">
                        Interactive Map (Non-interactive for users)
                      </Label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="static" id="static" />
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      <Label htmlFor="static" className="cursor-pointer">
                        Static Image
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Map URL Input */}
              {!settings.use_static_image && (
                <div className="space-y-2">
                  <Label htmlFor="map_url">Google Maps Embed URL</Label>
                  <Input
                    id="map_url"
                    value={settings.map_url}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      map_url: e.target.value
                    }))}
                    placeholder="Paste Google Maps embed URL here"
                  />
                  <p className="text-sm text-muted-foreground">
                    Get this URL from Google Maps → Share → Embed a map → Copy HTML (extract the src URL)
                  </p>
                </div>
              )}

              {/* Static Image Upload */}
              {settings.use_static_image && (
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Static Map Image</Label>
                  
                  {/* Current Image Preview */}
                  {settings.static_image_url && (
                    <div className="w-full h-40 rounded-lg bg-cover bg-center relative overflow-hidden border">
                      <img 
                        src={settings.static_image_url} 
                        alt="Static map preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      placeholder="Or paste image URL here"
                      value={settings.static_image_url}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        static_image_url: e.target.value
                      }))}
                      className="flex-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Upload Static Map Image</Label>
                    <HeroImageUpload
                      images={staticImages}
                      onImagesChange={handleStaticImagesChange}
                      maxImages={1}
                    />
                  </div>
                </div>
              )}

              {/* Preview Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Preview</Label>
                <Card className="border-primary/20 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-bold text-foreground mb-2">{settings.location_title}</h3>
                      <p className="text-muted-foreground">{settings.location_description}</p>
                    </div>
                    
                    <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                      {settings.use_static_image ? (
                        settings.static_image_url ? (
                          <img 
                            src={settings.static_image_url} 
                            alt="Static map"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <p className="text-muted-foreground">No static image uploaded</p>
                        )
                      ) : (
                        settings.map_url ? (
                          <iframe
                            src={settings.map_url}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Map Preview"
                            className="rounded-lg pointer-events-none"
                          />
                        ) : (
                          <p className="text-muted-foreground">No map URL provided</p>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

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