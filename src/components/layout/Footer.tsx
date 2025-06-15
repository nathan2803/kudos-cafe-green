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
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-white to-cream rounded-full overflow-hidden flex items-center justify-center shadow-lg border-2 border-primary/30">
                <img 
                  src="/lovable-uploads/da016ef6-2b42-47b0-9d80-859ae28b3bb6.png" 
                  alt="Kudos Cafe Professional Logo" 
                  className="w-full h-full object-cover rounded-full filter drop-shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-primary">Kudos Cafe</span>
                <span className="text-xs text-muted-foreground -mt-1">& Restaurant</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fresh flavors and green living come together at Kudos Cafe. 
              We're committed to sustainable dining experiences with locally 
              sourced ingredients and eco-friendly practices.
            </p>
            <div className="flex space-x-3">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/gallery" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Gallery
              </Link>
              <Link to="/menu" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Menu
              </Link>
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                <div className="text-sm text-muted-foreground">
                  <p>123 Green Street</p>
                  <p>Eco District, EC1 2AB</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">+44 (0) 20 7123 4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">hello@kudoscafe.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 mt-0.5 text-primary" />
                <div className="text-sm text-muted-foreground">
                  <p>Mon-Thu: 7:00 AM - 10:00 PM</p>
                  <p>Fri-Sat: 7:00 AM - 11:00 PM</p>
                  <p>Sunday: 8:00 AM - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest menu updates and eco-friendly initiatives.
            </p>
            <div className="space-y-2">
              <Input 
                placeholder="Enter your email" 
                className="bg-background border-primary/20 text-foreground placeholder:text-muted-foreground"
              />
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 Kudos Cafe & Restaurant. All rights reserved. | Made with 🌱 for sustainability
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1"
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