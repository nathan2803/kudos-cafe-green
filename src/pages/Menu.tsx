import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { supabase, MenuItem } from '@/lib/supabase'
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
  const { toast } = useToast()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [cart, setCart] = useState<{[key: string]: number}>({})
  const [loading, setLoading] = useState(true)

  const categories = [
    { id: 'all', name: 'All Items', icon: Award },
    { id: 'appetizers', name: 'Appetizers', icon: Zap },
    { id: 'mains', name: 'Main Courses', icon: Flame },
    { id: 'desserts', name: 'Desserts', icon: Heart },
    { id: 'beverages', name: 'Beverages', icon: Leaf }
  ]

  // Sample menu data - in real app, this would come from Supabase
  const sampleMenuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Organic Garden Salad',
      description: 'Fresh mixed greens, cherry tomatoes, cucumber, avocado with house-made green goddess dressing',
      price: 12.50,
      category: 'appetizers',
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['vegetarian', 'vegan', 'gluten-free'],
      is_popular: true,
      is_new: false
    },
    {
      id: '2',
      name: 'Sustainable Salmon',
      description: 'Wild-caught salmon fillet with quinoa pilaf, roasted vegetables, and lemon herb butter',
      price: 24.90,
      category: 'mains',
      image_url: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['gluten-free', 'high-protein'],
      is_popular: false,
      is_new: true
    },
    {
      id: '3',
      name: 'Green Smoothie Bowl',
      description: 'Spinach, mango, banana blend topped with granola, chia seeds, and fresh berries',
      price: 9.75,
      category: 'beverages',
      image_url: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['vegan', 'raw', 'superfood'],
      is_popular: true,
      is_new: false
    },
    {
      id: '4',
      name: 'Plant-Based Burger',
      description: 'House-made patty with lettuce, tomato, avocado, and special green sauce on whole grain bun',
      price: 16.50,
      category: 'mains',
      image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['vegan', 'high-protein'],
      is_popular: true,
      is_new: false
    },
    {
      id: '5',
      name: 'Eco-Friendly Pasta',
      description: 'Handmade pasta with seasonal vegetables, basil pesto, and organic parmesan',
      price: 18.25,
      category: 'mains',
      image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d29a?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['vegetarian'],
      is_popular: false,
      is_new: true
    },
    {
      id: '6',
      name: 'Raw Chocolate Tart',
      description: 'Decadent raw chocolate tart with cashew cream and fresh raspberries',
      price: 8.90,
      category: 'desserts',
      image_url: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['vegan', 'raw', 'no-sugar'],
      is_popular: true,
      is_new: false
    },
    {
      id: '7',
      name: 'Artisan Bruschetta',
      description: 'Toasted sourdough with heirloom tomatoes, fresh basil, and balsamic glaze',
      price: 11.00,
      category: 'appetizers',
      image_url: 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['vegetarian'],
      is_popular: false,
      is_new: false
    },
    {
      id: '8',
      name: 'Herbal Tea Blend',
      description: 'Organic chamomile, lavender, and mint tea - perfect for relaxation',
      price: 4.50,
      category: 'beverages',
      image_url: 'https://images.unsplash.com/photo-1563822249369-e8259c2e4c56?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['vegan', 'caffeine-free'],
      is_popular: false,
      is_new: false
    }
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setMenuItems(sampleMenuItems)
      setFilteredItems(sampleMenuItems)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = menuItems

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.dietary_tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

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

    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }))

    toast({
      title: "Added to cart",
      description: "Item has been added to your cart.",
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[itemId] > 1) {
        newCart[itemId]--
      } else {
        delete newCart[itemId]
      }
      return newCart
    })
  }

  const getCartItemCount = (itemId: string) => cart[itemId] || 0
  const getTotalCartItems = () => Object.values(cart).reduce((sum, count) => sum + count, 0)

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
      <section className="relative py-20 bg-gradient-to-br from-forest via-primary to-medium-green text-cream">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-light-green/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Leaf className="w-8 h-8 text-light-green" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Our <span className="text-light-green">Green</span> Menu
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-cream/90 max-w-2xl mx-auto">
            Discover our carefully curated selection of sustainable, locally-sourced dishes 
            that nourish both you and the planet.
          </p>

          {/* Cart Summary */}
          {getTotalCartItems() > 0 && (
            <div className="inline-flex items-center space-x-2 bg-light-green/20 backdrop-blur-sm rounded-full px-6 py-3">
              <ShoppingCart className="w-5 h-5 text-light-green" />
              <span className="text-light-green font-semibold">
                {getTotalCartItems()} item{getTotalCartItems() !== 1 ? 's' : ''} in cart
              </span>
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
              <TabsList className="grid w-full grid-cols-5 bg-background border border-primary/20">
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
                      <span className="text-xl font-bold text-primary">£{item.price.toFixed(2)}</span>
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
                            onClick={() => removeFromCart(item.id)}
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
                    £{selectedItem.price.toFixed(2)}
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
                        onClick={() => removeFromCart(selectedItem.id)}
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