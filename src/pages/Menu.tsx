import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/contexts/CartContext'
import { supabase } from '@/integrations/supabase/client'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  is_available: boolean
  dietary_tags?: string[]
  is_popular: boolean
  is_new: boolean
}
import { useToast } from '@/hooks/use-toast'
import { 
  Search, 
  Filter, 
  Heart, 
  Plus, 
  Minus, 
  ShoppingCart,
  Star,
  Leaf,
  Flame,
  Zap,
  Award
} from 'lucide-react'

export const Menu = () => {
  const { user } = useAuth()
  const { cart, addToCart: addToCartContext, updateQuantity, removeFromCart } = useCart()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [heroSettings, setHeroSettings] = useState({
    title: 'Our Green Menu',
    subtitle: 'Discover our carefully curated selection of sustainable, locally-sourced dishes that nourish both you and the planet.',
    button_text: 'Book Table & Order Now',
    background_image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop',
    overlay_opacity: 0.6,
    overlay_color: '#000000'
  })

  const categories = [
    { id: 'all', name: 'All Items', icon: Award },
    { id: 'Appetizers', name: 'Appetizers', icon: Zap },
    { id: 'Pasta', name: 'Pasta', icon: Star },
    { id: 'Main Course', name: 'Main Courses', icon: Flame },
    { id: 'Desserts', name: 'Desserts', icon: Heart },
    { id: 'Drinks', name: 'Beverages', icon: Leaf }
  ]

  // Kudos Cafe Menu Items
  const sampleMenuItems: MenuItem[] = [
    // Appetizers
    {
      id: '1',
      name: 'Mojos',
      description: 'Crispy potato wedges with signature seasoning',
      price: 125,
      category: 'appetizers',
      image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['vegetarian'],
      is_popular: false,
      is_new: false
    },
    {
      id: '2',
      name: 'Twister Fries',
      description: 'Spiral-cut fries with spicy coating',
      price: 145,
      category: 'appetizers',
      image_url: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['vegetarian'],
      is_popular: false,
      is_new: false
    },
    {
      id: '3',
      name: 'Bistro Fries',
      description: 'Thick-cut fries with garlic parmesan',
      price: 125,
      category: 'appetizers',
      image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['vegetarian'],
      is_popular: false,
      is_new: false
    },
    {
      id: '4',
      name: 'Buffalo Wings',
      description: 'Crispy fried chicken wings with buffalo sauce',
      price: 220,
      category: 'appetizers',
      image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['spicy'],
      is_popular: true,
      is_new: false
    },
    {
      id: '5',
      name: 'Hickory Wings',
      description: 'Smoky BBQ glazed chicken wings',
      price: 220,
      category: 'appetizers',
      image_url: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['bbq'],
      is_popular: false,
      is_new: false
    },
    {
      id: '6',
      name: 'Mozzarella Sticks',
      description: 'Fried mozzarella sticks with marinara dip',
      price: 165,
      category: 'appetizers',
      image_url: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['vegetarian'],
      is_popular: false,
      is_new: false
    },
    {
      id: '7',
      name: 'Nachos',
      description: 'Classic nachos with cheese dip',
      price: 135,
      category: 'appetizers',
      image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['vegetarian'],
      is_popular: false,
      is_new: false
    },
    {
      id: '8',
      name: 'Nachos Overload',
      description: 'Loaded nachos with ground beef and guacamole',
      price: 165,
      category: 'appetizers',
      image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['hearty'],
      is_popular: true,
      is_new: false
    },

    // Pasta
    {
      id: '9',
      name: 'Tuna Pesto',
      description: 'Tuna flakes in basil pesto sauce with pasta',
      price: 165,
      category: 'pasta',
      image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['seafood'],
      is_popular: false,
      is_new: false
    },
    {
      id: '10',
      name: 'Seafood Marinara',
      description: 'Mixed seafood in tomato marinara sauce',
      price: 175,
      category: 'pasta',
      image_url: 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['seafood'],
      is_popular: false,
      is_new: false
    },
    {
      id: '11',
      name: 'Truffle Carbonara',
      description: 'Creamy carbonara with truffle oil',
      price: 189,
      category: 'pasta',
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['creamy', 'premium'],
      is_popular: false,
      is_new: true
    },
    {
      id: '12',
      name: 'Aglio Olio',
      description: 'Garlic olive oil pasta with chili flakes',
      price: 165,
      category: 'pasta',
      image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d29a?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['vegetarian', 'spicy'],
      is_popular: false,
      is_new: false
    },

    // Main Courses
    {
      id: '13',
      name: 'Katsudon',
      description: 'Japanese pork cutlet rice bowl',
      price: 185,
      category: 'mains',
      image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['japanese'],
      is_popular: false,
      is_new: false
    },
    {
      id: '14',
      name: 'Lechon Kawali',
      description: 'Crispy fried pork belly',
      price: 195,
      category: 'mains',
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['filipino', 'crispy'],
      is_popular: true,
      is_new: false
    },
    {
      id: '15',
      name: 'Garlic Pepper Beef',
      description: 'Stir-fried beef with garlic and black pepper',
      price: 185,
      category: 'mains',
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['beef', 'stir-fried'],
      is_popular: false,
      is_new: false
    },
    {
      id: '16',
      name: 'Inalamangan Pork Rebusado',
      description: 'Crispy fried pork with calamansi dip',
      price: 175,
      category: 'mains',
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['filipino', 'crispy'],
      is_popular: false,
      is_new: false
    },
    {
      id: '17',
      name: 'Kudos Original',
      description: 'House special grilled chicken platter',
      price: 185,
      category: 'mains',
      image_url: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['signature', 'grilled'],
      is_popular: false,
      is_new: false
    },
    {
      id: '18',
      name: 'Crispy Chicken Kare-kare',
      description: 'Crispy chicken with peanut kare-kare sauce',
      price: 195,
      category: 'mains',
      image_url: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['filipino', 'crispy'],
      is_popular: false,
      is_new: true
    },

    // Desserts
    {
      id: '19',
      name: 'Smores',
      description: 'Classic campfire treat with chocolate and marshmallow',
      price: 155,
      category: 'desserts',
      image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['sweet'],
      is_popular: false,
      is_new: false
    },
    {
      id: '20',
      name: 'Golden Waffle',
      description: 'Golden brown waffle with maple syrup',
      price: 125,
      category: 'desserts',
      image_url: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['sweet'],
      is_popular: false,
      is_new: false
    },
    {
      id: '21',
      name: 'Nutella Waffle',
      description: 'Waffle loaded with Nutella spread',
      price: 125,
      category: 'desserts',
      image_url: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['sweet', 'nutella'],
      is_popular: true,
      is_new: false
    },
    {
      id: '22',
      name: 'Matcha Waffle',
      description: 'Green tea flavored waffle with red bean',
      price: 125,
      category: 'desserts',
      image_url: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['matcha', 'japanese'],
      is_popular: false,
      is_new: false
    },

    // Drinks
    {
      id: '23',
      name: 'Choco-Mint',
      description: 'Chocolate mint milkshake',
      price: 165,
      category: 'beverages',
      image_url: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['cold', 'chocolate'],
      is_popular: false,
      is_new: false
    },
    {
      id: '24',
      name: 'Matcha Caramel Overload',
      description: 'Matcha latte with caramel drizzle',
      price: 155,
      category: 'beverages',
      image_url: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['matcha', 'caramel'],
      is_popular: true,
      is_new: false
    },
    {
      id: '25',
      name: 'Biscoff Caramel Latte',
      description: 'Biscoff cookie flavored latte',
      price: 145,
      category: 'beverages',
      image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['coffee', 'biscoff'],
      is_popular: false,
      is_new: false
    },
    {
      id: '26',
      name: 'Dirty-Matcha Caramel',
      description: 'Espresso layered over matcha latte',
      price: 135,
      category: 'beverages',
      image_url: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['matcha', 'espresso'],
      is_popular: false,
      is_new: false
    }
  ]

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('category', { ascending: true });

        if (error) throw error;
        if (data) {
          setMenuItems(data);
          setFilteredItems(data);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
        // Fallback to sample data if database fetch fails
        setMenuItems(sampleMenuItems);
        setFilteredItems(sampleMenuItems);
      } finally {
        setLoading(false);
      }
    };

    const fetchHeroSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'menu_hero')
          .maybeSingle();

        if (error) throw error;
        if (data) {
          const settings = data.setting_value as unknown as typeof heroSettings;
          setHeroSettings(settings);
        }
      } catch (error) {
        console.error('Error fetching hero settings:', error);
      }
    };

    fetchMenuItems();
    fetchHeroSettings();
  }, [])

  useEffect(() => {
    let filtered = menuItems

    // Filter by category (case-insensitive)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.dietary_tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Sort filtered items: popular first, then alphabetical
    filtered.sort((a, b) => {
      // Popular items first
      if (a.is_popular && !b.is_popular) return -1
      if (!a.is_popular && b.is_popular) return 1
      
      // Then alphabetical by name
      return a.name.localeCompare(b.name)
    })

    setFilteredItems(filtered)
  }, [selectedCategory, searchQuery, menuItems])

  const addToCart = (itemId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart.",
      })
      return
    }

    const item = menuItems.find(item => item.id === itemId)
    if (item) {
      addToCartContext(item)
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      })
    }
  }

  const removeFromCartLocal = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId)
    if (cartItem && cartItem.quantity > 1) {
      updateQuantity(itemId, cartItem.quantity - 1)
    } else {
      removeFromCart(itemId)
    }
  }

  const getCartItemCount = (itemId: string) => cart.find(item => item.id === itemId)?.quantity || 0
  const getTotalCartItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)

  const getDietaryBadgeColor = (tag: string) => {
    switch (tag) {
      case 'vegan': return 'bg-green-100 text-green-800 border-green-200'
      case 'vegetarian': return 'bg-green-50 text-green-700 border-green-100'
      case 'gluten-free': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'high-protein': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'raw': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'superfood': return 'bg-pink-100 text-pink-800 border-pink-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative py-20 text-white min-h-[500px] flex items-center"
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
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-white to-cream rounded-full overflow-hidden flex items-center justify-center shadow-lg border-2 border-white/30 backdrop-blur-sm">
              <img 
                src="/lovable-uploads/10da77c8-bfac-41e7-8ab4-672648c51cc4.png" 
                alt="Kudos Cafe Professional Logo" 
                className="w-14 h-14 object-cover rounded-full filter drop-shadow-sm"
              />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {heroSettings.title}
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            {heroSettings.subtitle}
          </p>

          {/* Book Table Button */}
          <div className="mb-6">
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-white/90 font-semibold"
              onClick={() => navigate('/booking')}
            >
              {heroSettings.button_text}
            </Button>
          </div>

          {/* Cart Summary */}
          {getTotalCartItems() > 0 && (
            <div className="inline-flex items-center space-x-4 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">
                  {getTotalCartItems()} item{getTotalCartItems() !== 1 ? 's' : ''} in cart
                </span>
              </div>
              <Button 
                size="sm" 
                className="bg-white text-black hover:bg-white/90"
                onClick={() => navigate('/booking')}
              >
                Proceed to Booking
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-muted/30 border-b border-primary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search dishes, ingredients, or dietary tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1">
              <TabsList className="grid w-full grid-cols-6 bg-background border border-primary/20">
                {categories.map((category) => {
                  const IconComponent = category.icon
                  return (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="flex items-center space-x-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="hidden sm:inline">{category.name}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-muted animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3 mb-4" />
                    <div className="h-8 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden border-primary/20 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="relative">
                    <img 
                      src={item.image_url || `https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop`}
                      alt={item.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {item.is_popular && (
                        <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                      )}
                      {item.is_new && (
                        <Badge className="bg-accent text-accent-foreground">New</Badge>
                      )}
                    </div>
                    
                    {!item.is_available && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">Currently Unavailable</span>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 
                        className="text-lg font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setSelectedItem(item)}
                      >
                        {item.name}
                      </h3>
                      <span className="text-xl font-bold text-primary">₱{item.price}</span>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Dietary Tags */}
                    {item.dietary_tags && item.dietary_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.dietary_tags.slice(0, 3).map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="outline" 
                            className={`text-xs ${getDietaryBadgeColor(tag)}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {item.dietary_tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.dietary_tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Cart Controls */}
                    <div className="flex items-center justify-between">
                      {getCartItemCount(item.id) > 0 ? (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCartLocal(item.id)}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-semibold min-w-[2rem] text-center">
                            {getCartItemCount(item.id)}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => addToCart(item.id)}
                            className="w-8 h-8 p-0 bg-primary hover:bg-primary/90"
                            disabled={!item.is_available}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => addToCart(item.id)}
                          className="bg-primary hover:bg-primary/90"
                          disabled={!item.is_available}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add to Cart
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedItem(item)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredItems.length === 0 && !loading && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No dishes found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
              <img 
                src={selectedItem.image_url || `https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop`}
                alt={selectedItem.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.is_popular && (
                      <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                    )}
                    {selectedItem.is_new && (
                      <Badge className="bg-accent text-accent-foreground">New</Badge>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    ₱{selectedItem.price}
                  </span>
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                  {selectedItem.description}
                </p>

                {/* Dietary Information */}
                {selectedItem.dietary_tags && selectedItem.dietary_tags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Dietary Information</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.dietary_tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className={getDietaryBadgeColor(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Cart Section */}
                <div className="flex items-center justify-between pt-4 border-t border-primary/20">
                  {getCartItemCount(selectedItem.id) > 0 ? (
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => removeFromCartLocal(selectedItem.id)}
                        className="w-10 h-10 p-0"
                      >
                        <Minus className="w-5 h-5" />
                      </Button>
                      <span className="font-semibold text-lg min-w-[3rem] text-center">
                        {getCartItemCount(selectedItem.id)}
                      </span>
                      <Button
                        onClick={() => addToCart(selectedItem.id)}
                        className="w-10 h-10 p-0 bg-primary hover:bg-primary/90"
                        disabled={!selectedItem.is_available}
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => addToCart(selectedItem.id)}
                      className="bg-primary hover:bg-primary/90"
                      disabled={!selectedItem.is_available}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                  
                  {!selectedItem.is_available && (
                    <span className="text-destructive font-semibold">Currently Unavailable</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Menu