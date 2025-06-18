import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  Facebook,
  Instagram,
  MessageCircle
} from 'lucide-react'

interface ContactHeroSettings {
  title: string
  subtitle: string
  background_image: string
  overlay_opacity: number
  overlay_color: string
}

interface ContactMapSettings {
  map_enabled: boolean
  map_url: string
  location_title: string
  location_description: string
  use_static_image: boolean
  static_image_url: string
}

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

export const Contact = () => {
  const { toast } = useToast()
  const [heroSettings, setHeroSettings] = useState<ContactHeroSettings>({
    title: 'Contact Us',
    subtitle: "We'd love to hear from you. Get in touch with Kudos Cafe & Restaurant.",
    background_image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=600&fit=crop',
    overlay_opacity: 0.6,
    overlay_color: '#2D5016'
  })
  const [mapSettings, setMapSettings] = useState<ContactMapSettings>({
    map_enabled: true,
    map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.9896893845524!2d120.97901237586563!3d14.553362285910577!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397ca21af3e5fb9%3A0x5cd7c85e46a4c5dd!2sSM%20Mall%20of%20Asia!5e0!3m2!1sen!2sph!4v1734276000000!5m2!1sen!2sph',
    location_title: 'Find Us',
    location_description: 'Located at SM Mall of Asia, Quezon',
    use_static_image: false,
    static_image_url: ''
  })
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    title: '',
    subtitle: '',
    address_line1: 'SM Mall of Asia',
    address_line2: 'Seaside Blvd, Pasay, Quezon, Philippines',
    phone: '+63 2 8123 4567',
    phone_description: 'Call us for reservations',
    opening_hours: {
      weekdays: '7:00 AM - 10:00 PM',
      weekends: '7:00 AM - 11:00 PM'
    },
    restaurant_image: '',
    rating: ''
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchHeroSettings()
    fetchMapSettings()
    fetchContactInfo()
  }, [])

  const fetchHeroSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'contact_hero')
        .maybeSingle()

      if (error) throw error
      
      if (data?.setting_value) {
        setHeroSettings(data.setting_value as unknown as ContactHeroSettings)
      }
    } catch (error) {
      console.error('Error fetching contact hero settings:', error)
    }
  }

  const fetchMapSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'contact_map')
        .maybeSingle()

      if (error) throw error
      
      if (data?.setting_value) {
        setMapSettings(data.setting_value as unknown as ContactMapSettings)
      }
    } catch (error) {
      console.error('Error fetching contact map settings:', error)
    }
  }

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'contact_info')
        .maybeSingle()

      if (error) throw error
      
      if (data?.setting_value) {
        setContactInfo(data.setting_value as unknown as ContactInfo)
      }
    } catch (error) {
      console.error('Error fetching contact info:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Format the message with sender information
      const messageWithContactInfo = `
Contact Inquiry from: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}

Subject: ${formData.subject}

Message:
${formData.message}
      `.trim()

      const { error } = await supabase
        .from('order_messages')
        .insert({
          message_type: 'contact_inquiry',
          subject: formData.subject,
          message: messageWithContactInfo,
          sender_id: null, // No authenticated user
          order_id: null, // Not tied to an order
          is_urgent: false,
          is_read: false
        })

      if (error) throw error

      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      })
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative py-20 text-white min-h-[400px] flex items-center"
        style={{
          backgroundImage: `url(${heroSettings.background_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: heroSettings.overlay_color,
            opacity: heroSettings.overlay_opacity
          }}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {heroSettings.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            {heroSettings.subtitle}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Get in Touch</h2>
                <p className="text-muted-foreground text-lg">
                  Have a question about our menu, want to make a reservation, or just want to say hello? 
                  We're here to help and would love to hear from you.
                </p>
              </div>

              <div className="space-y-6">
                {/* Location */}
                <Card className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Visit Our Restaurant</h3>
                        <p className="text-muted-foreground">
                          {contactInfo.address_line1}<br />
                          {contactInfo.address_line2}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Phone */}
                <Card className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Call Us</h3>
                        <p className="text-muted-foreground">
                          {contactInfo.phone}<br />
                          {contactInfo.phone_description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Email */}
                <Card className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Email Us</h3>
                        <p className="text-muted-foreground">
                          General: info@kudoscafe.com<br />
                          Reservations: reservations@kudoscafe.com
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Hours */}
                <Card className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Opening Hours</h3>
                        <div className="text-muted-foreground space-y-1">
                          <p>Weekdays: {contactInfo.opening_hours.weekdays}</p>
                          <p>Weekends: {contactInfo.opening_hours.weekends}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <Button variant="outline" size="icon" className="border-primary/20 hover:bg-primary hover:text-primary-foreground" asChild>
                    <a href="https://www.facebook.com/KudosCafeAndResto" target="_blank" rel="noopener noreferrer">
                      <Facebook className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button variant="outline" size="icon" className="border-primary/20 hover:bg-primary hover:text-primary-foreground" asChild>
                    <a href="https://www.instagram.com/kudoscafeandresto/" target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                          Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="border-primary/20 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                          Email *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="border-primary/20 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="border-primary/20 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="border-primary/20 focus:ring-primary"
                        placeholder="What's this about?"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className="border-primary/20 focus:ring-primary resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {loading ? 'Sending...' : (
                        <>
                          Send Message
                          <Send className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      {mapSettings.map_enabled && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">{mapSettings.location_title}</h2>
              <p className="text-muted-foreground">{mapSettings.location_description}</p>
            </div>
            
            <Card className="border-primary/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full h-96">
                  {mapSettings.use_static_image ? (
                    mapSettings.static_image_url ? (
                      <img 
                        src={mapSettings.static_image_url} 
                        alt="Restaurant location map"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
                        <p className="text-muted-foreground">Map image not available</p>
                      </div>
                    )
                  ) : (
                    <iframe
                      src={mapSettings.map_url}
                      width="100%"
                      height="100%"
                      style={{ border: 0, pointerEvents: 'none' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Kudos Cafe & Restaurant Location"
                      className="rounded-lg"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  )
}

export default Contact