import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { HeroImageUpload } from './HeroImageUpload'
import { 
  Save, 
  Eye
} from 'lucide-react'

interface HeroContent {
  title_line1: string
  title_line2: string
  subtitle: string
  background_images: string[]
}

export const HeroManagement = () => {
  const [content, setContent] = useState<HeroContent>({
    title_line1: '',
    title_line2: '',
    subtitle: '',
    background_images: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchHeroContent()
  }, [])

  const fetchHeroContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'hero_content')
        .single()

      if (error) throw error
      
      if (data?.setting_value) {
        setContent(data.setting_value as unknown as HeroContent)
      }
    } catch (error) {
      console.error('Error fetching hero content:', error)
      toast({
        title: "Error",
        description: "Failed to fetch hero content",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          setting_value: content as unknown as any
        })
        .eq('setting_key', 'hero_content')

      if (error) throw error

      toast({
        title: "Success",
        description: "Hero content updated successfully"
      })
    } catch (error) {
      console.error('Error saving hero content:', error)
      toast({
        title: "Error",
        description: "Failed to save hero content",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImagesChange = (images: string[]) => {
    setContent(prev => ({
      ...prev,
      background_images: images
    }))
  }

  if (loading) {
    return <div className="text-center py-8">Loading hero content...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Hero Section</h2>
          <p className="text-muted-foreground">Manage your homepage hero content and background images</p>
        </div>
        
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Text Content */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Text Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title_line1">Title Line 1</Label>
              <Input
                id="title_line1"
                value={content.title_line1}
                onChange={(e) => setContent(prev => ({ ...prev, title_line1: e.target.value }))}
                placeholder="e.g., Fresh Flavors"
              />
            </div>

            <div>
              <Label htmlFor="title_line2">Title Line 2</Label>
              <Input
                id="title_line2"
                value={content.title_line2}
                onChange={(e) => setContent(prev => ({ ...prev, title_line2: e.target.value }))}
                placeholder="e.g., Green Living"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={content.subtitle}
                onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Enter your hero subtitle text..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Background Images */}
        <Card>
          <CardHeader>
            <CardTitle>Background Images</CardTitle>
          </CardHeader>
          <CardContent>
            <HeroImageUpload
              images={content.background_images}
              onImagesChange={handleImagesChange}
              maxImages={10}
              disabled={saving}
            />
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
              {content.background_images[0] && (
                <img 
                  src={content.background_images[0]} 
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-forest/80 via-forest/60 to-primary/40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-2xl font-bold mb-2">
                    <span className="block">{content.title_line1 || 'Title Line 1'}</span>
                    <span className="block text-light-green">{content.title_line2 || 'Title Line 2'}</span>
                  </h1>
                  <p className="text-sm text-cream/90">
                    {content.subtitle || 'Your subtitle will appear here...'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}