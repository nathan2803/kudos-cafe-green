import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthPage } from './Auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'

interface Order {
  id: string
  user_id: string
  items: any[]
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  delivery_address?: string
  order_type: 'dine_in' | 'pickup' | 'delivery'
  created_at: string
  updated_at: string
  order_number?: string
  deposit_paid?: number
}

interface Review {
  id: string
  user_id: string
  order_id?: string
  menu_item_id?: string
  rating: number
  comment: string
  is_approved: boolean
  admin_response?: string
  created_at: string
  updated_at: string
  orders?: {
    order_number: string
  }
  menu_items?: {
    name: string
  }
}
import { useToast } from '@/hooks/use-toast'
import { EnhancedOrderHistory } from '@/components/profile/EnhancedOrderHistory'
import { MessagesInbox } from '@/components/profile/MessagesInbox'
import { ReviewForm } from '@/components/profile/ReviewForm'
import { ReviewsList } from '@/components/profile/ReviewsList'
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
  X,
  MessageSquare
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

interface UserPreferences {
  id?: string
  user_id: string
  notification_email: boolean
  notification_sms: boolean
  notification_promotional: boolean
  address_line1?: string
  address_line2?: string
  city?: string
  postal_code?: string
  dietary_restrictions: string[]
}

export const Profile = () => {
  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  
  // Get the tab from URL params or default to 'overview'
  const urlParams = new URLSearchParams(location.search)
  const initialTab = urlParams.get('tab') || 'overview'
  const [activeTab, setActiveTab] = useState(initialTab)
  
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
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [orderFilter, setOrderFilter] = useState<string>('all')
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [menuItems, setMenuItems] = useState<any[]>([])

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut allergies', 
    'Shellfish allergies', 'Low sodium', 'Keto', 'Paleo', 'Organic only'
  ]

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const tab = urlParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [location.search])

  useEffect(() => {
    if (userProfile) {
      fetchUserData()
      fetchUserOrders()
      fetchUserReviews()
      fetchMenuItems()
    }
  }, [userProfile])

  const fetchUserReviews = async () => {
    if (!user) return
    
    setReviewsLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          orders:order_id (order_number),
          menu_items:menu_item_id (name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data as any || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive"
      })
    } finally {
      setReviewsLoading(false)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name')
        .eq('is_available', true)

      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error('Error fetching menu items:', error)
    }
  }

  const fetchUserData = async () => {
    if (!user) return
    
    try {
      // Fetch user preferences
      const { data: userPrefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (prefsError && prefsError.code !== 'PGRST116') {
        throw prefsError
      }

      if (userPrefs) {
        setPreferences(userPrefs)
        setProfile({
          full_name: userProfile?.full_name || '',
          email: userProfile?.email || '',
          phone: userProfile?.phone || '',
          address_line1: userPrefs.address_line1 || '',
          address_line2: userPrefs.address_line2 || '',
          city: userPrefs.city || '',
          postal_code: userPrefs.postal_code || '',
          dietary_restrictions: userPrefs.dietary_restrictions || [],
          notification_settings: {
            email: userPrefs.notification_email,
            sms: userPrefs.notification_sms,
            promotional: userPrefs.notification_promotional
          }
        })
      } else {
        // Set default profile values
        setProfile({
          full_name: userProfile?.full_name || '',
          email: userProfile?.email || '',
          phone: userProfile?.phone || '',
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
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast({
        title: "Error",
        description: "Failed to load user preferences",
        variant: "destructive"
      })
    }
  }

  const fetchUserOrders = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      console.log('Fetching orders for user:', user.id)
      
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

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Raw orders data:', orders)
      
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
        order_type: order.order_type as 'dine_in' | 'pickup' | 'delivery',
        created_at: order.created_at,
        updated_at: order.updated_at,
        order_number: order.order_number,
        deposit_paid: order.deposit_paid
      })) || []

      console.log('Transformed orders:', transformedOrders)
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
    if (!user) return
    
    setUpdating(true)
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone
        })
        .eq('user_id', user.id)

      if (profileError) throw profileError

      // Upsert user preferences
      const preferencesData = {
        user_id: user.id,
        notification_email: profile.notification_settings.email,
        notification_sms: profile.notification_settings.sms,
        notification_promotional: profile.notification_settings.promotional,
        address_line1: profile.address_line1,
        address_line2: profile.address_line2,
        city: profile.city,
        postal_code: profile.postal_code,
        dietary_restrictions: profile.dietary_restrictions
      }

      const { error: prefsError } = await supabase
        .from('user_preferences')
        .upsert(preferencesData, { onConflict: 'user_id' })

      if (prefsError) throw prefsError

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
      setIsEditing(false)
      fetchUserData() // Refresh data
    } catch (error) {
      console.error('Profile update error:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    navigate(`/profile?tab=${tab}`)
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-muted/30">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
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
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={updating}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <EnhancedOrderHistory 
              orders={orders}
              loading={loading}
              onRefresh={fetchUserOrders}
            />
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <MessagesInbox />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">My Reviews</h2>
              <ReviewForm 
                onReviewSubmitted={fetchUserReviews}
                orders={orders}
                menuItems={menuItems}
              />
            </div>
            
            <ReviewsList 
              reviews={reviews}
              loading={reviewsLoading}
              onRefresh={fetchUserReviews}
            />
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