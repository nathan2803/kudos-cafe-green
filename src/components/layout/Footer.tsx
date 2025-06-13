import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { 
  Leaf, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Instagram, 
  Twitter,
  Shield
} from 'lucide-react'

export const Footer = () => {
  const { isAdmin } = useAuth()

  return (
    <footer className="bg-forest text-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-light-green rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-forest" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold">Kudos Cafe</span>
                <span className="text-xs opacity-80">& Restaurant</span>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Fresh flavors and green living come together at Kudos Cafe. 
              We're committed to sustainable dining experiences with locally 
              sourced ingredients and eco-friendly practices.
            </p>
            <div className="flex space-x-3">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-cream hover:bg-light-green hover:text-forest">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-cream hover:bg-light-green hover:text-forest">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-cream hover:bg-light-green hover:text-forest">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-sm opacity-80 hover:opacity-100 hover:text-light-green transition-colors">
                Home
              </Link>
              <Link to="/gallery" className="block text-sm opacity-80 hover:opacity-100 hover:text-light-green transition-colors">
                Gallery
              </Link>
              <Link to="/menu" className="block text-sm opacity-80 hover:opacity-100 hover:text-light-green transition-colors">
                Menu
              </Link>
              <Link to="/contact" className="block text-sm opacity-80 hover:opacity-100 hover:text-light-green transition-colors">
                Contact Us
              </Link>
              <Link to="/about" className="block text-sm opacity-80 hover:opacity-100 hover:text-light-green transition-colors">
                About Us
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 text-light-green" />
                <div className="text-sm opacity-80">
                  <p>123 Green Street</p>
                  <p>Eco District, EC1 2AB</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-light-green" />
                <span className="text-sm opacity-80">+44 (0) 20 7123 4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-light-green" />
                <span className="text-sm opacity-80">hello@kudoscafe.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 mt-0.5 text-light-green" />
                <div className="text-sm opacity-80">
                  <p>Mon-Thu: 7:00 AM - 10:00 PM</p>
                  <p>Fri-Sat: 7:00 AM - 11:00 PM</p>
                  <p>Sunday: 8:00 AM - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stay Updated</h3>
            <p className="text-sm opacity-80">
              Subscribe to our newsletter for the latest menu updates and eco-friendly initiatives.
            </p>
            <div className="space-y-2">
              <Input 
                placeholder="Enter your email" 
                className="bg-forest/50 border-light-green/30 text-cream placeholder:text-cream/60"
              />
              <Button className="w-full bg-light-green text-forest hover:bg-light-green/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-light-green/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm opacity-80">
            © 2024 Kudos Cafe & Restaurant. All rights reserved. | Made with 🌱 for sustainability
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/privacy" className="text-sm opacity-80 hover:opacity-100 hover:text-light-green transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm opacity-80 hover:opacity-100 hover:text-light-green transition-colors">
              Terms of Service
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-xs opacity-60 hover:opacity-100 hover:text-light-green transition-colors flex items-center space-x-1"
              >
                <Shield className="w-3 h-3" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}