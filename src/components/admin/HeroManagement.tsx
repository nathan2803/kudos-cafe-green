import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { 
  Save, 
  Plus, 
  Trash2,
  Image as ImageIcon,
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
        .upsert({
          setting_key: 'hero_content',
          setting_value: content as unknown as any
        })

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

  const addBackgroundImage = () => {
    setContent(prev => ({
      ...prev,
      background_images: [...prev.background_images, '']
    }))
  }

  const updateBackgroundImage = (index: number, url: string) => {
    setContent(prev => ({
      ...prev,
      background_images: prev.background_images.map((img, i) => 
        i === index ? url : img
      )
    }))
  }

  const removeBackgroundImage = (index: number) => {
    setContent(prev => ({
      ...prev,
      background_images: prev.background_images.filter((_, i) => i !== index)
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
            <div className="flex justify-between items-center">
              <CardTitle>Background Images</CardTitle>
              <Button onClick={addBackgroundImage} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.background_images.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                <p>No background images yet. Add your first image to get started.</p>
              </div>
            ) : (
              content.background_images.map((image, index) => (
                <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor={`image-${index}`}>Image URL {index + 1}</Label>
                    <Input
                      id={`image-${index}`}
                      value={image}
                      onChange={(e) => updateBackgroundImage(index, e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  
                  {image && (
                    <div className="w-20 h-12 rounded overflow-hidden border">
                      <img 
                        src={image} 
                        alt={`Background ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBackgroundImage(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
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