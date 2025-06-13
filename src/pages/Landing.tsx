import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { supabase, MenuItem, Review } from '@/lib/supabase'
import { 
  Star, 
  Leaf, 
  Heart, 
  Utensils, 
  Clock, 
  MapPin, 
  Phone,
  ChefHat,
  Sparkles,
  ArrowRight,
  Award,
  Recycle
} from 'lucide-react'

export const Landing = () => {
  const { user } = useAuth()
  const [featuredDishes, setFeaturedDishes] = useState<MenuItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedContent()
  }, [])

  const fetchFeaturedContent = async () => {
    try {
      // Fetch featured dishes
      const { data: dishes } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .or('is_popular.eq.true,is_new.eq.true')
        .limit(6)

      // Fetch recent reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          *,
          users(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(6)

      setFeaturedDishes(dishes || [])
      setReviews(reviewsData || [])
    } catch (error) {
      console.error('Error fetching featured content:', error)
    } finally {
      setLoading(false)
    }
  }

  const heroBackgrounds = [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=1920&h=1080&fit=crop'
  ]

  const [currentBg, setCurrentBg] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % heroBackgrounds.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const statsData = [
    { icon: Award, label: '5-Star Rating', value: '4.9/5' },
    { icon: Utensils, label: 'Dishes Served', value: '50K+' },
    { icon: Recycle, label: 'Eco-Friendly', value: '100%' },
    { icon: Heart, label: 'Happy Customers', value: '10K+' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Images with Parallax */}
        <div className="absolute inset-0">
          {heroBackgrounds.map((bg, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBg ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: 'scale(1.1)'
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-forest/80 via-forest/60 to-primary/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-light-green rounded-full flex items-center justify-center mb-4">
              <Leaf className="w-8 h-8 text-forest" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="block">Fresh Flavors</span>
            <span className="block text-light-green">Green Living</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-cream/90 max-w-2xl mx-auto leading-relaxed">
            Experience sustainable dining at its finest. Locally sourced ingredients, 
            eco-friendly practices, and unforgettable flavors await you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-light-green text-forest hover:bg-light-green/90 text-lg px-8 py-6"
            >
              <Link to="/menu">
                View Our Menu
                <ChefHat className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border-light-green text-light-green hover:bg-light-green hover:text-forest text-lg px-8 py-6"
            >
              <Link to="/gallery">
                Explore Gallery
                <Sparkles className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-8 h-8 text-light-green mx-auto mb-2" />
                <div className="text-2xl font-bold text-light-green">{stat.value}</div>
                <div className="text-sm text-cream/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="w-6 h-10 border-2 border-light-green rounded-full flex justify-center">
            <div className="w-1 h-3 bg-light-green rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-primary">
                <Leaf className="w-6 h-6" />
                <span className="text-sm font-semibold uppercase tracking-wide">About Kudos Cafe</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Where <span className="text-primary">Sustainability</span> Meets <span className="text-primary">Flavor</span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                At Kudos Cafe & Restaurant, we believe that great food and environmental responsibility 
                go hand in hand. Our commitment to sustainability extends from our locally sourced, 
                organic ingredients to our zero-waste kitchen practices.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                    <Leaf className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Locally Sourced</h4>
                    <p className="text-sm text-muted-foreground">Fresh ingredients from local farms</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                    <Recycle className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Zero Waste</h4>
                    <p className="text-sm text-muted-foreground">Eco-friendly kitchen practices</p>
                  </div>
                </div>
              </div>

              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link to="/about">
                  Learn More About Us
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1571197200840-ca4a3e07e1f8?w=400&h=300&fit=crop" 
                  alt="Fresh ingredients"
                  className="rounded-lg shadow-lg"
                />
                <img 
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop" 
                  alt="Sustainable cooking"
                  className="rounded-lg shadow-lg mt-8"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Award className="w-12 h-12 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 text-primary mb-4">
              <ChefHat className="w-6 h-6" />
              <span className="text-sm font-semibold uppercase tracking-wide">Featured Dishes</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Taste the <span className="text-primary">Green</span> Difference
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our most popular and newest dishes, crafted with love and sustainable ingredients
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-muted animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDishes.map((dish) => (
                <Card key={dish.id} className="overflow-hidden border-primary/20 hover:shadow-lg transition-shadow group">
                  <div className="relative">
                    <img 
                      src={dish.image_url || `https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop`}
                      alt={dish.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {dish.is_popular && (
                        <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                      )}
                      {dish.is_new && (
                        <Badge className="bg-accent text-accent-foreground">New</Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{dish.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{dish.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary">£{dish.price.toFixed(2)}</span>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        {user ? 'Add to Cart' : 'View Details'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/menu">
                View Full Menu
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 text-primary mb-4">
              <Star className="w-6 h-6" />
              <span className="text-sm font-semibold uppercase tracking-wide">Customer Reviews</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              What Our <span className="text-primary">Customers</span> Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of satisfied customers who love our sustainable dining experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id} className="border-primary/20 p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? 'text-primary fill-primary' : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{review.comment}"</p>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {review.user?.full_name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{review.user?.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              // Default reviews when no data
              [
                { id: 1, name: 'Sarah Johnson', rating: 5, comment: 'Amazing food and great commitment to sustainability!', date: '2024-01-15' },
                { id: 2, name: 'Mike Chen', rating: 5, comment: 'Best eco-friendly restaurant in town. Fresh ingredients, delicious meals!', date: '2024-01-12' },
                { id: 3, name: 'Emma Davis', rating: 4, comment: 'Love the green initiative and the food is absolutely delicious.', date: '2024-01-10' },
                { id: 4, name: 'James Wilson', rating: 5, comment: 'Outstanding service and incredible flavors. Highly recommended!', date: '2024-01-08' },
                { id: 5, name: 'Lisa Thompson', rating: 5, comment: 'Finally, a restaurant that cares about both taste and environment!', date: '2024-01-05' },
                { id: 6, name: 'David Brown', rating: 4, comment: 'Great atmosphere, friendly staff, and the green theme is beautiful.', date: '2024-01-03' }
              ].map((review) => (
                <Card key={review.id} className="border-primary/20 p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? 'text-primary fill-primary' : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{review.comment}"</p>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {review.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{review.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {user && (
            <div className="text-center mt-12">
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Link to="/reviews">
                  Write a Review
                  <Star className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-forest text-cream">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-light-green">
                <MapPin className="w-6 h-6" />
                <span className="text-sm font-semibold uppercase tracking-wide">Visit Us</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Experience <span className="text-light-green">Green Dining</span> Today
              </h2>
              
              <p className="text-lg text-cream/90 leading-relaxed">
                Come and discover the perfect blend of sustainable practices and exceptional flavors. 
                We're open and ready to serve you the finest eco-friendly dining experience.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-light-green/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-light-green" />
                  </div>
                  <div>
                    <p className="font-semibold">123 Green Street, Eco District</p>
                    <p className="text-cream/80">London, EC1 2AB</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-light-green/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-light-green" />
                  </div>
                  <div>
                    <p className="font-semibold">+44 (0) 20 7123 4567</p>
                    <p className="text-cream/80">Call us for reservations</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-light-green/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-light-green" />
                  </div>
                  <div>
                    <p className="font-semibold">Mon-Thu: 7AM - 10PM</p>
                    <p className="text-cream/80">Fri-Sat: 7AM - 11PM, Sun: 8AM - 9PM</p>
                  </div>
                </div>
              </div>

              <Button asChild size="lg" className="bg-light-green text-forest hover:bg-light-green/90">
                <Link to="/contact">
                  Get Directions
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop"
                alt="Restaurant exterior"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-light-green/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-light-green">4.9</div>
                  <div className="text-xs text-cream">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing