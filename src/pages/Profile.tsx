import { useState, useEffect } from 'react'
import { AuthPage } from './Auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'

interface Order {
  id: string
  user_id: string
  items: any[]
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  delivery_address?: string
  order_type: 'dine_in' | 'pickup' | 'takeout'
  created_at: string
  updated_at: string
  order_number?: string
}

interface Review {
  id: string
  user_id: string
  menu_item_id?: string
  rating: number
  comment: string
  created_at: string
  user?: {
    full_name: string
  }
}
import { useToast } from '@/hooks/use-toast'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Bell, 
  Shield, 
  Star,
  Clock,
  Award,
  Heart,
  Settings,
  Package,
  Edit2,
  Save,
  X
} from 'lucide-react'

interface UserProfile {
  full_name: string
  email: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  postal_code: string
  dietary_restrictions: string[]
  notification_settings: {
    email: boolean
    sms: boolean
    promotional: boolean
  }
}

export const Profile = () => {
  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    dietary_restrictions: [],
    notification_settings: {
      email: true,
      sms: false,
      promotional: true
    }
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)


  const sampleReviews: Review[] = [
    {
      id: '1',
      user_id: user?.id || '',
      menu_item_id: '1',
      rating: 5,
      comment: 'Amazing fresh salad! The green goddess dressing is incredible.',
      created_at: '2024-01-16T09:00:00Z'
    },
    {
      id: '2',
      user_id: user?.id || '',
      rating: 4,
      comment: 'Great sustainable dining experience. Love the eco-friendly approach!',
      created_at: '2024-01-10T15:30:00Z'
    }
  ]

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut allergies', 
    'Shellfish allergies', 'Low sodium', 'Keto', 'Paleo', 'Organic only'
  ]

  useEffect(() => {
    if (userProfile) {
      setProfile({
        full_name: userProfile.full_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        address_line1: '',
        address_line2: '',
        city: '',
        postal_code: '',
        dietary_restrictions: [],
        notification_settings: {
          email: true,
          sms: false,
          promotional: true
        }
      })
      
      fetchUserOrders()
      setReviews(sampleReviews)
    }
  }, [userProfile])

  const fetchUserOrders = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (name, price)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform the data to match our Order interface
      const transformedOrders: Order[] = orders?.map(order => ({
        id: order.id,
        user_id: order.user_id,
        items: order.order_items?.map((item: any) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price: item.unit_price,
          name: item.menu_items?.name || 'Unknown Item',
          special_instructions: item.special_instructions
        })) || [],
        total_amount: order.total_amount,
        status: order.status as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled',
        order_type: order.order_type as 'dine_in' | 'pickup' | 'takeout',
        created_at: order.created_at,
        updated_at: order.updated_at,
        order_number: order.order_number
      })) || []

      setOrders(transformedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: "Error",
        description: "Failed to load order history",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      // In a real app, this would update the Supabase database
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-orange-100 text-orange-800'
      case 'ready': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user || !userProfile) {
    return <AuthPage />
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="w-20 h-20 border-4 border-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {userProfile.full_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {userProfile.full_name || 'User Profile'}
              </h1>
              <p className="text-muted-foreground mb-4">
                Member since {new Date(userProfile.created_at).toLocaleDateString('en-GB', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Award className="w-3 h-3 mr-1" />
                  Bronze Member
                </Badge>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Heart className="w-3 h-3 mr-1" />
                  Eco Warrior
                </Badge>
              </div>
            </div>
            
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className={isEditing ? "" : "bg-primary hover:bg-primary/90"}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-muted/30">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-primary" />
                    <span>Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.full_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address1">Address Line 1</Label>
                    <Input
                      id="address1"
                      value={profile.address_line1}
                      onChange={(e) => setProfile(prev => ({ ...prev, address_line1: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="123 Green Street"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                    <Input
                      id="address2"
                      value={profile.address_line2}
                      onChange={(e) => setProfile(prev => ({ ...prev, address_line2: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Apt 4B"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profile.city}
                        onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="London"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postal">Postal Code</Label>
                      <Input
                        id="postal"
                        value={profile.postal_code}
                        onChange={(e) => setProfile(prev => ({ ...prev, postal_code: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="EC1 2AB"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {isEditing && (
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span>Order History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-primary/20 rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                           <div className="flex items-center space-x-4">
                             <div>
                               <p className="font-semibold">
                                 {order.order_number || `Order #${order.id.slice(0, 8)}`}
                               </p>
                               <p className="text-sm text-muted-foreground">
                                 {formatDate(order.created_at)}
                               </p>
                             </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="text-right mt-2 md:mt-0">
                            <p className="font-semibold text-lg">₱{order.total_amount.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {order.order_type}
                            </p>
                          </div>
                        </div>
                        
                         <div className="space-y-2">
                           {order.items.map((item, index) => (
                             <div key={index} className="flex justify-between text-sm">
                               <span>{item.quantity}x {item.name}</span>
                               <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                             </div>
                           ))}
                         </div>
                        
                        {order.delivery_address && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {order.delivery_address}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders yet. Start exploring our menu!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span>My Reviews</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border border-primary/20 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating ? 'text-primary fill-primary' : 'text-muted'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                        {review.menu_item_id && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Review for: Menu Item #{review.menu_item_id}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reviews yet. Share your dining experience!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-primary" />
                  <span>Dietary Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {dietaryOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={profile.dietary_restrictions.includes(option)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setProfile(prev => ({
                              ...prev,
                              dietary_restrictions: [...prev.dietary_restrictions, option]
                            }))
                          } else {
                            setProfile(prev => ({
                              ...prev,
                              dietary_restrictions: prev.dietary_restrictions.filter(item => item !== option)
                            }))
                          }
                        }}
                        disabled={!isEditing}
                      />
                      <Label htmlFor={option} className="text-sm">{option}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <span>Notification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive order updates via email</p>
                  </div>
                  <Checkbox
                    checked={profile.notification_settings.email}
                    onCheckedChange={(checked) => 
                      setProfile(prev => ({
                        ...prev,
                        notification_settings: { ...prev.notification_settings, email: checked as boolean }
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive order updates via SMS</p>
                  </div>
                  <Checkbox
                    checked={profile.notification_settings.sms}
                    onCheckedChange={(checked) => 
                      setProfile(prev => ({
                        ...prev,
                        notification_settings: { ...prev.notification_settings, sms: checked as boolean }
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Promotional Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive special offers and news</p>
                  </div>
                  <Checkbox
                    checked={profile.notification_settings.promotional}
                    onCheckedChange={(checked) => 
                      setProfile(prev => ({
                        ...prev,
                        notification_settings: { ...prev.notification_settings, promotional: checked as boolean }
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-destructive">
                  <Shield className="w-5 h-5" />
                  <span>Account Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Profile