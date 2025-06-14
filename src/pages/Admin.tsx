import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/hooks/useAuth'
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

interface Order {
  id: string
  user_id: string
  items: any[]
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  delivery_address?: string
  order_type: 'dine-in' | 'takeaway' | 'delivery'
  created_at: string
  updated_at: string
}

interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  is_admin: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
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
  Shield, 
  Users, 
  Package, 
  ChefHat, 
  Star, 
  TrendingUp, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  AlertTriangle,
  Package2,
  Warehouse,
  ShoppingCart,
  TrendingDown,
  Archive,
  Bell,
  Activity,
  Download
} from 'lucide-react'

export const Admin = () => {
  const { user, userProfile, isAdmin } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)

  // State for different data sections
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([])
  const [analytics, setAnalytics] = useState({
    totalRevenue: 12450.75,
    totalOrders: 342,
    totalCustomers: 156,
    averageRating: 4.7,
    weeklyGrowth: 12.5,
    monthlyGrowth: 23.8,
    totalInventoryValue: 8750.25,
    lowStockItems: 12,
    outOfStockItems: 3
  })

  // Sample data
  const sampleMenuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Organic Garden Salad',
      description: 'Fresh mixed greens with house-made dressing',
      price: 12.50,
      category: 'appetizers',
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['vegetarian', 'vegan'],
      is_popular: true,
      is_new: false
    },
    {
      id: '2',
      name: 'Sustainable Salmon',
      description: 'Wild-caught salmon with quinoa pilaf',
      price: 24.90,
      category: 'mains',
      image_url: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop',
      is_available: true,
      dietary_tags: ['gluten-free'],
      is_popular: false,
      is_new: true
    }
  ]

  const sampleOrders: Order[] = [
    {
      id: '1',
      user_id: '123',
      items: [{ menu_item_id: '1', quantity: 2, price: 12.50 }],
      total_amount: 25.00,
      status: 'preparing',
      order_type: 'dine-in',
      created_at: '2024-01-20T14:30:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      user_id: '124',
      items: [{ menu_item_id: '2', quantity: 1, price: 24.90 }],
      total_amount: 24.90,
      status: 'delivered',
      order_type: 'delivery',
      created_at: '2024-01-20T13:15:00Z',
      updated_at: '2024-01-20T14:45:00Z'
    }
  ]

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setMenuItems(sampleMenuItems)
      setOrders(sampleOrders)
      setLoading(false)
    }, 1000)
  }, [])

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'ready': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus as any, updated_at: new Date().toISOString() }
        : order
    ))
    toast({
      title: "Order updated",
      description: `Order #${orderId} status changed to ${newStatus}`,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-forest text-cream py-6 border-b border-primary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-light-green/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-light-green" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-cream/80">Kudos Cafe Management System</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-cream/80">Welcome back,</p>
              <p className="font-semibold">{userProfile?.full_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-muted/30">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center space-x-2">
              <ChefHat className="w-4 h-4" />
              <span className="hidden sm:inline">Menu</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center space-x-2">
              <Warehouse className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-primary">₱{analytics.totalRevenue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-500">+{analytics.monthlyGrowth}%</span>
                    <span className="text-muted-foreground ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold text-primary">{analytics.totalOrders}</p>
                    </div>
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-500">+{analytics.weeklyGrowth}%</span>
                    <span className="text-muted-foreground ml-1">from last week</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Customers</p>
                      <p className="text-2xl font-bold text-primary">{analytics.totalCustomers}</p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-500">+8.2%</span>
                    <span className="text-muted-foreground ml-1">new this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                      <p className="text-2xl font-bold text-primary">{analytics.averageRating}</p>
                    </div>
                    <Star className="w-8 h-8 text-primary" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                    <span className="text-green-500">Excellent</span>
                    <span className="text-muted-foreground ml-1">rating</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <p className="text-sm font-medium">₱{order.total_amount.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Menu Item
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Tasks
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Management Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search orders..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => (
                <Card key={order.id} className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatDate(order.created_at)} • {order.order_type}
                        </p>
                        <div className="text-sm">
                          {order.items.map((item, index) => (
                            <span key={index}>
                              {item.quantity}x Menu Item #{item.menu_item_id}
                              {index < order.items.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:items-end space-y-2 mt-4 md:mt-0">
                        <p className="text-lg font-bold">₱{order.total_amount.toFixed(2)}</p>
                        <div className="flex space-x-2">
                          <Select 
                            value={order.status} 
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="preparing">Preparing</SelectItem>
                              <SelectItem value="ready">Ready</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Menu Management Tab */}
          <TabsContent value="menu" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Menu Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Menu Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemName">Item Name</Label>
                      <Input id="itemName" placeholder="Enter item name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Enter description" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₱)</Label>
                        <Input id="price" type="number" step="0.01" placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="appetizers">Appetizers</SelectItem>
                            <SelectItem value="mains">Main Courses</SelectItem>
                            <SelectItem value="desserts">Desserts</SelectItem>
                            <SelectItem value="beverages">Beverages</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="available" />
                      <Label htmlFor="available">Available</Label>
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90">Add Item</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <Card key={item.id} className="border-primary/20">
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop'}
                    alt={item.name}
                    className="w-full h-32 object-cover"
                  />
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <span className="font-bold text-primary">₱{item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-1">
                        {item.is_popular && (
                          <Badge className="text-xs bg-primary text-primary-foreground">Popular</Badge>
                        )}
                        {item.is_new && (
                          <Badge className="text-xs bg-accent text-accent-foreground">New</Badge>
                        )}
                        {!item.is_available && (
                          <Badge className="text-xs bg-destructive text-destructive-foreground">Unavailable</Badge>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive-foreground hover:bg-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Inventory Management Tab */}
          <TabsContent value="inventory" className="space-y-6">
            {/* Inventory Header with Overview Cards */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Inventory Management</h2>
                  <p className="text-muted-foreground">Track and manage restaurant inventory, stock levels, and supplies</p>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Inventory Item</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="itemName">Item Name</Label>
                            <Input id="itemName" placeholder="Enter item name" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" placeholder="Enter description" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input id="sku" placeholder="Enter SKU" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="food-beverages">Food & Beverages</SelectItem>
                                <SelectItem value="kitchen-equipment">Kitchen Equipment</SelectItem>
                                <SelectItem value="dining-room">Dining Room</SelectItem>
                                <SelectItem value="cleaning">Cleaning & Maintenance</SelectItem>
                                <SelectItem value="office">Office & Administrative</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="currentStock">Current Stock</Label>
                              <Input id="currentStock" type="number" step="0.01" placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="unit">Unit</Label>
                              <Input id="unit" placeholder="e.g., pieces, lbs, bottles" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="minStock">Min Stock Level</Label>
                              <Input id="minStock" type="number" step="0.01" placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="maxStock">Max Stock Level</Label>
                              <Input id="maxStock" type="number" step="0.01" placeholder="0.00" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="currentPrice">Current Price (₱)</Label>
                              <Input id="currentPrice" type="number" step="0.01" placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="location">Storage Location</Label>
                              <Input id="location" placeholder="e.g., Freezer A, Pantry B" />
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Switch id="perishable" />
                              <Label htmlFor="perishable">Perishable</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="active" defaultChecked />
                              <Label htmlFor="active">Active</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full bg-primary hover:bg-primary/90 mt-4">Add Item</Button>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline">
                    <Archive className="w-4 h-4 mr-2" />
                    Restock
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Inventory Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Inventory Value</p>
                        <p className="text-2xl font-bold text-primary">₱{analytics.totalInventoryValue.toLocaleString()}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-primary" />
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-500">+5.2%</span>
                      <span className="text-muted-foreground ml-1">from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Low Stock Items</p>
                        <p className="text-2xl font-bold text-orange-600">{analytics.lowStockItems}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <TrendingDown className="w-4 h-4 text-orange-500 mr-1" />
                      <span className="text-orange-500">Needs attention</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Out of Stock</p>
                        <p className="text-2xl font-bold text-red-600">{analytics.outOfStockItems}</p>
                      </div>
                      <Package2 className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-red-500">Critical</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Items</p>
                        <p className="text-2xl font-bold text-primary">247</p>
                      </div>
                      <Warehouse className="w-8 h-8 text-primary" />
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <Activity className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-blue-500">Active</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Inventory Management Interface */}
              <div className="space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input placeholder="Search inventory items..." className="pl-10" />
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="food-beverages">Food & Beverages</SelectItem>
                        <SelectItem value="kitchen-equipment">Kitchen Equipment</SelectItem>
                        <SelectItem value="dining-room">Dining Room</SelectItem>
                        <SelectItem value="cleaning">Cleaning & Maintenance</SelectItem>
                        <SelectItem value="office">Office & Administrative</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Stock Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="in-stock">In Stock</SelectItem>
                        <SelectItem value="low-stock">Low Stock</SelectItem>
                        <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>

                {/* Sample Inventory Items */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Sample Item 1 - Chicken Breast */}
                  <Card className="border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Chicken Breast</h3>
                              <p className="text-sm text-muted-foreground">SKU: CHK-BRST-001</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Food & Beverages</Badge>
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">Low Stock</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Current Stock</p>
                              <p className="font-medium">25.5 lbs</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Min Level</p>
                              <p className="font-medium">10.0 lbs</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Price</p>
                              <p className="font-medium">₱9.20/lb</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Location</p>
                              <p className="font-medium">Freezer A</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4 md:mt-0">
                          <Button size="sm" variant="outline">
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Restock
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sample Item 2 - Olive Oil */}
                  <Card className="border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Extra Virgin Olive Oil</h3>
                              <p className="text-sm text-muted-foreground">SKU: OIL-OLV-001</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Food & Beverages</Badge>
                            <Badge className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Current Stock</p>
                              <p className="font-medium">15 bottles</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Min Level</p>
                              <p className="font-medium">5 bottles</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Price</p>
                              <p className="font-medium">₱13.50/bottle</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Location</p>
                              <p className="font-medium">Pantry B</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4 md:mt-0">
                          <Button size="sm" variant="outline">
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Restock
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sample Item 3 - Chef Knife */}
                  <Card className="border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <ChefHat className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Professional Chef Knife</h3>
                              <p className="text-sm text-muted-foreground">SKU: KNF-CHF-001</p>
                            </div>
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">Kitchen Equipment</Badge>
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">Low Stock</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Current Stock</p>
                              <p className="font-medium">3 pieces</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Min Level</p>
                              <p className="font-medium">2 pieces</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Price</p>
                              <p className="font-medium">₱45.00/piece</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Location</p>
                              <p className="font-medium">Kitchen Storage</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4 md:mt-0">
                          <Button size="sm" variant="outline">
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Restock
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sample Item 4 - Dining Chairs */}
                  <Card className="border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Dining Chair</h3>
                              <p className="text-sm text-muted-foreground">SKU: CHR-DIN-001</p>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Dining Room</Badge>
                            <Badge className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Current Stock</p>
                              <p className="font-medium">8 pieces</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Min Level</p>
                              <p className="font-medium">4 pieces</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Price</p>
                              <p className="font-medium">₱90.00/piece</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Location</p>
                              <p className="font-medium">Dining Storage</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4 md:mt-0">
                          <Button size="sm" variant="outline">
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Restock
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Low Stock Alerts Section */}
                <Card className="border-primary/20 mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="w-5 h-5 mr-2 text-orange-500" />
                      Low Stock Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-orange-500" />
                          <div>
                            <p className="font-medium">Chicken Breast is running low</p>
                            <p className="text-sm text-muted-foreground">Current: 25.5 lbs • Min: 10.0 lbs</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Reorder
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="font-medium">Professional Chef Knife is critically low</p>
                            <p className="text-sm text-muted-foreground">Current: 3 pieces • Min: 2 pieces</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Urgent Reorder
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">User Management</h3>
              <p className="text-muted-foreground">User management features will be available soon.</p>
            </div>
          </TabsContent>

          {/* Reviews Management Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Review Management</h3>
              <p className="text-muted-foreground">Review management features will be available soon.</p>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground">Detailed analytics and reports will be available soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Admin