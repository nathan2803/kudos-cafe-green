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
  Eye,
  MapPin,
  Phone,
  Clock
} from 'lucide-react'

interface ContactInfo {
  title: string
  subtitle: string
  address_line1: string
  address_line2: string
  phone: string
  phone_description: string
  opening_hours: {
    weekdays: string
    weekends: string
  }
  restaurant_image: string
  rating: string
}

export const ContactManagement = () => {
  const [content, setContent] = useState<ContactInfo>({
    title: '',
    subtitle: '',
    address_line1: '',
    address_line2: '',
    phone: '',
    phone_description: '',
    opening_hours: {
      weekdays: '',
      weekends: ''
    },
    restaurant_image: '',
    rating: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'contact_info')
        .single()

      if (error) throw error
      
      if (data?.setting_value) {
        setContent(data.setting_value as unknown as ContactInfo)
      }
    } catch (error) {
      console.error('Error fetching contact info:', error)
      toast({
        title: "Error",
        description: "Failed to fetch contact information",
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
        .eq('setting_key', 'contact_info')

      if (error) throw error

      toast({
        title: "Success",
        description: "Contact information updated successfully"
      })
    } catch (error) {
      console.error('Error saving contact info:', error)
      toast({
        title: "Error",
        description: "Failed to save contact information",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImageChange = (images: string[]) => {
    setContent(prev => ({
      ...prev,
      restaurant_image: images[0] || ''
    }))
  }

  if (loading) {
    return <div className="text-center py-8">Loading contact information...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Visit Us Section</h2>
          <p className="text-muted-foreground">Manage your contact information, address, and restaurant details</p>
        </div>
        
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Header Content */}
        <Card>
          <CardHeader>
            <CardTitle>Header Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={content.title}
                onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Experience Green Dining Today"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={content.subtitle}
                onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Enter your description text..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address_line1">Address Line 1</Label>
              <Input
                id="address_line1"
                value={content.address_line1}
                onChange={(e) => setContent(prev => ({ ...prev, address_line1: e.target.value }))}
                placeholder="e.g., 123 Green Street, Eco District"
              />
            </div>

            <div>
              <Label htmlFor="address_line2">Address Line 2</Label>
              <Input
                id="address_line2"
                value={content.address_line2}
                onChange={(e) => setContent(prev => ({ ...prev, address_line2: e.target.value }))}
                placeholder="e.g., London, EC1 2AB"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={content.phone}
                onChange={(e) => setContent(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g., +44 (0) 20 7123 4567"
              />
            </div>

            <div>
              <Label htmlFor="phone_description">Phone Description</Label>
              <Input
                id="phone_description"
                value={content.phone_description}
                onChange={(e) => setContent(prev => ({ ...prev, phone_description: e.target.value }))}
                placeholder="e.g., Call us for reservations"
              />
            </div>

            <div>
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                value={content.rating}
                onChange={(e) => setContent(prev => ({ ...prev, rating: e.target.value }))}
                placeholder="e.g., 4.9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Opening Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="weekdays">Weekdays (Monday - Friday)</Label>
              <Input
                id="weekdays"
                value={content.opening_hours.weekdays}
                onChange={(e) => setContent(prev => ({ 
                  ...prev, 
                  opening_hours: { ...prev.opening_hours, weekdays: e.target.value }
                }))}
                placeholder="e.g., 3PM - 11PM"
              />
            </div>

            <div>
              <Label htmlFor="weekends">Weekends (Saturday - Sunday)</Label>
              <Input
                id="weekends"
                value={content.opening_hours.weekends}
                onChange={(e) => setContent(prev => ({ 
                  ...prev, 
                  opening_hours: { ...prev.opening_hours, weekends: e.target.value }
                }))}
                placeholder="e.g., 3PM - 12PM"
              />
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Image */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Image</CardTitle>
          </CardHeader>
          <CardContent>
            <HeroImageUpload
              images={content.restaurant_image ? [content.restaurant_image] : []}
              onImagesChange={handleImageChange}
              maxImages={1}
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
            <div className="bg-forest text-cream p-6 rounded-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-light-green">
                    <MapPin className="w-6 h-6" />
                    <span className="text-sm font-semibold uppercase tracking-wide">Visit Us</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold leading-tight">
                    {content.title || 'Your title will appear here...'}
                  </h2>
                  
                  <p className="text-sm text-cream/90">
                    {content.subtitle || 'Your subtitle will appear here...'}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-light-green/20 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-light-green" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{content.address_line1 || 'Address Line 1'}</p>
                        <p className="text-cream/80 text-xs">{content.address_line2 || 'Address Line 2'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-light-green/20 rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4 text-light-green" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{content.phone || 'Phone Number'}</p>
                        <p className="text-cream/80 text-xs">{content.phone_description || 'Phone Description'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-light-green/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-light-green" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Weekdays: {content.opening_hours.weekdays || 'Hours'}</p>
                        <p className="text-cream/80 text-xs">
                          Weekends: {content.opening_hours.weekends || 'Hours'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  {content.restaurant_image ? (
                    <img 
                      src={content.restaurant_image} 
                      alt="Restaurant preview"
                      className="rounded-lg w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="rounded-lg w-full h-48 bg-muted flex items-center justify-center">
                      <p className="text-muted-foreground">No image uploaded</p>
                    </div>
                  )}
                  <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-light-green/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                      <div className="text-sm font-bold text-light-green">{content.rating || '0.0'}</div>
                      <div className="text-xs text-cream">Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}