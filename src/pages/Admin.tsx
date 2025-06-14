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
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded'
  order_type: 'pickup' | 'takeout' | 'dine_in'
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  notes?: string
  deposit_paid?: number
  remaining_amount?: number
  reservation_id?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
  reservations?: Reservation
}

interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  total_price: number
  special_instructions?: string
  menu_items?: MenuItem
}

interface Table {
  id: string
  table_number: number
  capacity: number
  location: string
  is_available: boolean
  created_at: string
  updated_at: string
}

interface Reservation {
  id: string
  user_id?: string
  table_id: string
  order_id?: string
  party_size: number
  reservation_date: string
  reservation_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  special_requests?: string
  deposit_amount?: number
  created_at: string
  updated_at: string
  tables?: Table
  orders?: Order
  profiles?: User
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
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockStatusFilter, setStockStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  
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

  const [tables, setTables] = useState<Table[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])

  const sampleOrders: Order[] = [
    {
      id: '1',
      user_id: '123',
      total_amount: 25.00,
      status: 'preparing',
      payment_status: 'paid',
      order_type: 'dine_in',
      customer_name: 'John Doe',
      customer_phone: '+1234567890',
      created_at: '2024-01-20T14:30:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      user_id: '124',
      total_amount: 24.90,
      status: 'delivered',
      payment_status: 'paid',
      order_type: 'takeout',
      customer_name: 'Jane Smith',
      customer_phone: '+1234567891',
      created_at: '2024-01-20T13:15:00Z',
      updated_at: '2024-01-20T14:45:00Z'
    }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch menu items
        const { data: menuData } = await supabase
          .from('menu_items')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (menuData) setMenuItems(menuData);

        // Fetch inventory items with categories
        const { data: inventoryData } = await supabase
          .from('inventory_items')
          .select(`
            *,
            categories (
              name,
              color
            )
          `)
          .order('created_at', { ascending: false });
        
        if (inventoryData) setInventoryItems(inventoryData);

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (categoriesData) setCategories(categoriesData);

        // Fetch suppliers
        const { data: suppliersData } = await supabase
          .from('suppliers')
          .select('*')
          .order('name');
        
        if (suppliersData) setSuppliers(suppliersData);

        // Fetch orders with related data
        const { data: ordersData } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              menu_items (name, price)
            ),
            reservations (
              *,
              tables (table_number, location)
            )
          `)
          .order('created_at', { ascending: false });
        
        if (ordersData) setOrders(ordersData as any);

        // Fetch tables
        const { data: tablesData } = await supabase
          .from('tables')
          .select('*')
          .order('table_number');
        
        if (tablesData) setTables(tablesData as any);

        // Fetch reservations with related data
        const { data: reservationsData } = await supabase
          .from('reservations')
          .select(`
            *,
            tables (table_number, location),
            orders (total_amount, status),
            profiles (full_name, email, phone)
          `)
          .order('reservation_date', { ascending: false });
        
        if (reservationsData) setReservations(reservationsData as any);

        // Calculate analytics
        if (inventoryData) {
          const totalValue = inventoryData.reduce((sum, item) => 
            sum + (parseFloat(String(item.current_stock)) * parseFloat(String(item.current_price || '0'))), 0);
          const lowStockCount = inventoryData.filter(item => 
            parseFloat(String(item.current_stock)) <= parseFloat(String(item.min_stock_level))).length;
          const outOfStockCount = inventoryData.filter(item => 
            parseFloat(String(item.current_stock)) === 0).length;
          
          setAnalytics(prev => ({
            ...prev,
            totalInventoryValue: totalValue,
            lowStockItems: lowStockCount,
            outOfStockItems: outOfStockCount
          }));
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Inventory item handlers
  const handleAddInventoryItem = async (formData: any) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([formData])
        .select(`
          *,
          categories (
            name,
            color
          )
        `);

      if (error) throw error;

      if (data) {
        setInventoryItems(prev => [data[0], ...prev]);
        toast({
          title: "Success",
          description: "Inventory item added successfully"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add inventory item",
        variant: "destructive"
      });
    }
  };

  const handleUpdateInventoryItem = async (itemId: string, formData: any) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(formData)
        .eq('id', itemId)
        .select(`
          *,
          categories (
            name,
            color
          )
        `);

      if (error) throw error;

      if (data) {
        setInventoryItems(prev => prev.map(item => 
          item.id === itemId ? data[0] : item
        ));
        toast({
          title: "Success",
          description: "Inventory item updated successfully"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update inventory item",
        variant: "destructive"
      });
    }
  };

  const handleRestockItem = async (itemId: string, restockData: any) => {
    try {
      // Update inventory item stock
      const currentItem = inventoryItems.find(item => item.id === itemId);
      if (!currentItem) return;

      const newStock = parseFloat(currentItem.current_stock) + parseFloat(restockData.quantity);
      
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ 
          current_stock: newStock,
          current_price: restockData.unit_price 
        })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Add stock movement record
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([{
          item_id: itemId,
          movement_type: 'IN',
          quantity: parseFloat(restockData.quantity),
          unit_price: parseFloat(restockData.unit_price),
          total_cost: parseFloat(restockData.quantity) * parseFloat(restockData.unit_price),
          supplier_id: restockData.supplier_id,
          reason: 'Restock',
          created_by: user?.id
        }]);

      if (movementError) throw movementError;

      // Update local state
      setInventoryItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, current_stock: newStock, current_price: restockData.unit_price }
          : item
      ));

      toast({
        title: "Success",
        description: "Item restocked successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to restock item",
        variant: "destructive"
      });
    }
  };

  // Menu item handlers
  const handleAddMenuItem = async (formData: any) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([formData])
        .select();

      if (error) throw error;

      if (data) {
        setMenuItems(prev => [data[0], ...prev]);
        toast({
          title: "Success",
          description: "Menu item added successfully"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add menu item",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setMenuItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Success",
        description: "Menu item deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete menu item",
        variant: "destructive"
      });
    }
  };

  // Additional inventory handlers
  const handleRemoveStock = async (itemId: string, removeData: any) => {
    try {
      const currentItem = inventoryItems.find(item => item.id === itemId);
      if (!currentItem) return;

      const currentStock = parseFloat(String(currentItem.current_stock));
      const removeQuantity = parseFloat(removeData.quantity);
      
      if (removeQuantity > currentStock) {
        toast({
          title: "Error",
          description: "Cannot remove more stock than available",
          variant: "destructive"
        });
        return;
      }

      const newStock = currentStock - removeQuantity;
      
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ current_stock: newStock })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Add stock movement record
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([{
          item_id: itemId,
          movement_type: 'OUT',
          quantity: removeQuantity,
          reason: removeData.reason || 'Stock usage',
          created_by: user?.id
        }]);

      if (movementError) throw movementError;

      // Update local state
      setInventoryItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, current_stock: newStock }
          : item
      ));

      toast({
        title: "Success",
        description: "Stock removed successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove stock",
        variant: "destructive"
      });
    }
  };

  const handleReorderItem = async (itemId: string, urgent: boolean = false) => {
    try {
      const currentItem = inventoryItems.find(item => item.id === itemId);
      if (!currentItem) return;

      const reorderQuantity = parseFloat(String(currentItem.max_stock_level || currentItem.min_stock_level)) * 2;
      
      // This would typically integrate with a procurement system
      // For now, we'll just show a success message and create a stock movement record
      const { error } = await supabase
        .from('stock_movements')
        .insert([{
          item_id: itemId,
          movement_type: 'IN',
          quantity: reorderQuantity,
          reason: urgent ? 'Urgent reorder request' : 'Automatic reorder request',
          created_by: user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Reorder Initiated",
        description: `${urgent ? 'Urgent reorder' : 'Reorder'} request created for ${currentItem.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create reorder request",
        variant: "destructive"
      });
    }
  };

  // Filter and sort inventory items
  const filteredInventoryItems = inventoryItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || item.category_id === categoryFilter;
      
      let matchesStatus = true;
      if (stockStatusFilter === 'in-stock') {
        matchesStatus = parseFloat(String(item.current_stock)) > parseFloat(String(item.min_stock_level));
      } else if (stockStatusFilter === 'low-stock') {
        matchesStatus = parseFloat(String(item.current_stock)) <= parseFloat(String(item.min_stock_level)) && 
                      parseFloat(String(item.current_stock)) > 0;
      } else if (stockStatusFilter === 'out-of-stock') {
        matchesStatus = parseFloat(String(item.current_stock)) === 0;
      }
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stock':
          return parseFloat(String(b.current_stock)) - parseFloat(String(a.current_stock));
        case 'price':
          return parseFloat(String(b.current_price || '0')) - parseFloat(String(a.current_price || '0'));
        case 'category':
          return (a.categories?.name || '').localeCompare(b.categories?.name || '');
        default:
          return 0;
      }
    });

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
                          <p><strong>Customer:</strong> {order.customer_name}</p>
                          <p><strong>Phone:</strong> {order.customer_phone}</p>
                          {order.order_items && order.order_items.length > 0 ? (
                            order.order_items.map((item, index) => (
                              <span key={index}>
                                {item.quantity}x {item.menu_items?.name || `Item #${item.menu_item_id}`}
                                {index < order.order_items.length - 1 && ', '}
                              </span>
                            ))
                          ) : (
                            <span>No items found</span>
                          )}
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
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        const newItem = {
                          name: formData.get('name'),
                          description: formData.get('description'),
                          sku: formData.get('sku'),
                          category_id: formData.get('category_id'),
                          current_stock: parseFloat(formData.get('current_stock') as string),
                          unit_of_measurement: formData.get('unit'),
                          min_stock_level: parseFloat(formData.get('min_stock') as string),
                          max_stock_level: parseFloat(formData.get('max_stock') as string) || null,
                          current_price: parseFloat(formData.get('current_price') as string),
                          storage_location: formData.get('location'),
                          is_perishable: formData.get('perishable') === 'on',
                          is_active: formData.get('active') === 'on'
                        };
                        handleAddInventoryItem(newItem);
                      }}>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="itemName">Item Name</Label>
                              <Input name="name" id="itemName" placeholder="Enter item name" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="description">Description</Label>
                              <Textarea name="description" id="description" placeholder="Enter description" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="sku">SKU</Label>
                              <Input name="sku" id="sku" placeholder="Enter SKU" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="category">Category</Label>
                              <Select name="category_id" required>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="currentStock">Current Stock</Label>
                                <Input name="current_stock" id="currentStock" type="number" step="0.01" placeholder="0.00" required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="unit">Unit</Label>
                                <Input name="unit" id="unit" placeholder="e.g., pieces, lbs, bottles" required />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="minStock">Min Stock Level</Label>
                                <Input name="min_stock" id="minStock" type="number" step="0.01" placeholder="0.00" required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="maxStock">Max Stock Level</Label>
                                <Input name="max_stock" id="maxStock" type="number" step="0.01" placeholder="0.00" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="currentPrice">Current Price (₱)</Label>
                                <Input name="current_price" id="currentPrice" type="number" step="0.01" placeholder="0.00" required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="location">Storage Location</Label>
                                <Input name="location" id="location" placeholder="e.g., Freezer A, Pantry B" />
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Switch name="perishable" id="perishable" />
                                <Label htmlFor="perishable">Perishable</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch name="active" id="active" defaultChecked />
                                <Label htmlFor="active">Active</Label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-4">Add Item</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Archive className="w-4 h-4 mr-2" />
                        Restock
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Bulk Restock Items</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          This will create restock requests for all items below minimum stock levels.
                        </p>
                        <Button 
                          className="w-full" 
                          onClick={() => {
                            const lowStockItems = filteredInventoryItems.filter(item => 
                              parseFloat(String(item.current_stock)) <= parseFloat(String(item.min_stock_level))
                            );
                            lowStockItems.forEach(item => handleReorderItem(item.id, false));
                            toast({
                              title: "Bulk Restock Initiated",
                              description: `Created restock requests for ${lowStockItems.length} items`
                            });
                          }}
                        >
                          Create Restock Requests
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const csvData = [
                        ['Name', 'SKU', 'Category', 'Current Stock', 'Min Level', 'Price', 'Location', 'Status'].join(','),
                        ...filteredInventoryItems.map(item => [
                          item.name,
                          item.sku || '',
                          item.categories?.name || '',
                          item.current_stock,
                          item.min_stock_level,
                          item.current_price || '0',
                          item.storage_location || '',
                          parseFloat(String(item.current_stock)) <= parseFloat(String(item.min_stock_level)) 
                            ? (parseFloat(String(item.current_stock)) === 0 ? 'Out of Stock' : 'Low Stock')
                            : 'In Stock'
                        ].join(','))
                      ].join('\n');
                      
                      const blob = new Blob([csvData], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                      
                      toast({
                        title: "Export Successful",
                        description: "Inventory data exported to CSV file"
                      });
                    }}
                  >
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
                    <Input 
                      placeholder="Search inventory items..." 
                      className="pl-10" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
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
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="stock">Stock</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Real Inventory Items from Database */}
                <div className="grid grid-cols-1 gap-4">
                  {filteredInventoryItems.length === 0 ? (
                    <Card className="border-primary/20">
                      <CardContent className="p-6 text-center">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {searchTerm || categoryFilter !== 'all' || stockStatusFilter !== 'all' 
                            ? 'No inventory items match your search criteria.' 
                            : 'No inventory items found. Add some items to get started.'}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredInventoryItems.map((item) => (
                      <Card key={item.id} className="border-primary/20">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-2">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                  item.categories?.name === 'Food & Beverages' ? 'bg-blue-100' :
                                  item.categories?.name === 'Kitchen Equipment' ? 'bg-purple-100' :
                                  item.categories?.name === 'Dining Room' ? 'bg-yellow-100' :
                                  item.categories?.name === 'Cleaning & Maintenance' ? 'bg-green-100' :
                                  'bg-gray-100'
                                }`}>
                                  <Package className={`w-6 h-6 ${
                                    item.categories?.name === 'Food & Beverages' ? 'text-blue-600' :
                                    item.categories?.name === 'Kitchen Equipment' ? 'text-purple-600' :
                                    item.categories?.name === 'Dining Room' ? 'text-yellow-600' :
                                    item.categories?.name === 'Cleaning & Maintenance' ? 'text-green-600' :
                                    'text-gray-600'
                                  }`} />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{item.name}</h3>
                                  <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                                </div>
                                <Badge className={`${
                                  item.categories?.name === 'Food & Beverages' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  item.categories?.name === 'Kitchen Equipment' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                  item.categories?.name === 'Dining Room' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                  item.categories?.name === 'Cleaning & Maintenance' ? 'bg-green-100 text-green-800 border-green-200' :
                                  'bg-gray-100 text-gray-800 border-gray-200'
                                }`}>
                                  {item.categories?.name || 'Uncategorized'}
                                </Badge>
                                <Badge className={`${
                                  parseFloat(item.current_stock) <= parseFloat(item.min_stock_level) 
                                    ? parseFloat(item.current_stock) === 0 
                                      ? 'bg-red-100 text-red-800 border-red-200' 
                                      : 'bg-orange-100 text-orange-800 border-orange-200'
                                    : 'bg-green-100 text-green-800 border-green-200'
                                }`}>
                                  {parseFloat(item.current_stock) <= parseFloat(item.min_stock_level) 
                                    ? parseFloat(item.current_stock) === 0 
                                      ? 'Out of Stock' 
                                      : 'Low Stock'
                                    : 'In Stock'}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Current Stock</p>
                                  <p className="font-medium">{item.current_stock} {item.unit_of_measurement}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Min Level</p>
                                  <p className="font-medium">{item.min_stock_level} {item.unit_of_measurement}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Price</p>
                                  <p className="font-medium">₱{parseFloat(item.current_price || '0').toFixed(2)}/{item.unit_of_measurement}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Location</p>
                                  <p className="font-medium">{item.storage_location}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2 mt-4 md:mt-0">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <ShoppingCart className="w-4 h-4 mr-1" />
                                    Restock
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Restock {item.name}</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target as HTMLFormElement);
                                    const restockData = {
                                      quantity: formData.get('quantity'),
                                      unit_price: formData.get('unit_price'),
                                      supplier_id: formData.get('supplier_id')
                                    };
                                    handleRestockItem(item.id, restockData);
                                  }}>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>Current Stock</Label>
                                          <Input value={`${item.current_stock} ${item.unit_of_measurement}`} disabled />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Add Quantity</Label>
                                          <Input name="quantity" type="number" step="0.01" placeholder="0.00" required />
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>Unit Price (₱)</Label>
                                          <Input name="unit_price" type="number" step="0.01" defaultValue={item.current_price} required />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Supplier</Label>
                                          <Select name="supplier_id">
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select supplier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {suppliers.map((supplier) => (
                                                <SelectItem key={supplier.id} value={supplier.id}>
                                                  {supplier.name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <Button type="submit" className="w-full">Update Stock</Button>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit {item.name}</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target as HTMLFormElement);
                                    const updateData = {
                                      name: formData.get('name'),
                                      description: formData.get('description'),
                                      min_stock_level: formData.get('min_stock_level'),
                                      storage_location: formData.get('storage_location')
                                    };
                                    handleUpdateInventoryItem(item.id, updateData);
                                  }}>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label>Item Name</Label>
                                        <Input name="name" defaultValue={item.name} required />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea name="description" defaultValue={item.description || ''} />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>Min Stock Level</Label>
                                          <Input name="min_stock_level" type="number" step="0.01" defaultValue={item.min_stock_level} required />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Storage Location</Label>
                                          <Input name="storage_location" defaultValue={item.storage_location || ''} />
                                        </div>
                                      </div>
                                      <Button type="submit" className="w-full">Save Changes</Button>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Remove
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Remove Stock - {item.name}</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target as HTMLFormElement);
                                    const removeData = {
                                      quantity: formData.get('quantity'),
                                      reason: formData.get('reason')
                                    };
                                    handleRemoveStock(item.id, removeData);
                                  }}>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>Current Stock</Label>
                                          <Input value={`${item.current_stock} ${item.unit_of_measurement}`} disabled />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Remove Quantity</Label>
                                          <Input 
                                            name="quantity" 
                                            type="number" 
                                            step="0.01" 
                                            max={item.current_stock}
                                            placeholder="0.00" 
                                            required 
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Reason</Label>
                                        <Select name="reason" required>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select reason" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Used in kitchen">Used in kitchen</SelectItem>
                                            <SelectItem value="Sold to customer">Sold to customer</SelectItem>
                                            <SelectItem value="Damaged/Expired">Damaged/Expired</SelectItem>
                                            <SelectItem value="Transferred">Transferred</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button type="submit" className="w-full" variant="destructive">
                                        Remove Stock
                                      </Button>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Item Details - {item.name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Item Name</Label>
                                        <p className="text-lg font-semibold">{item.name}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                        <p>{item.description || 'No description available'}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">SKU</Label>
                                        <p className="font-mono">{item.sku}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                                        <p>{item.categories?.name || 'Uncategorized'}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Storage Location</Label>
                                        <p>{item.storage_location || 'Not specified'}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Current Stock</Label>
                                        <p className="text-2xl font-bold text-primary">
                                          {item.current_stock} {item.unit_of_measurement}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Min Stock Level</Label>
                                        <p>{item.min_stock_level} {item.unit_of_measurement}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Max Stock Level</Label>
                                        <p>{item.max_stock_level || 'Not set'} {item.unit_of_measurement}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Current Price</Label>
                                        <p className="text-xl font-semibold">₱{parseFloat(item.current_price || '0').toFixed(2)}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Total Value</Label>
                                        <p className="text-lg font-semibold text-green-600">
                                          ₱{(parseFloat(String(item.current_stock)) * parseFloat(String(item.current_price || '0'))).toFixed(2)}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-4">
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">Perishable</Label>
                                          <p>{item.is_perishable ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">Active</Label>
                                          <p>{item.is_active ? 'Yes' : 'No'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
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
                      {filteredInventoryItems
                        .filter(item => parseFloat(String(item.current_stock)) <= parseFloat(String(item.min_stock_level)))
                        .map((item) => (
                          <div 
                            key={item.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              parseFloat(String(item.current_stock)) === 0 
                                ? 'bg-red-50 border-red-200' 
                                : 'bg-orange-50 border-orange-200'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <AlertTriangle className={`w-5 h-5 ${
                                parseFloat(String(item.current_stock)) === 0 ? 'text-red-500' : 'text-orange-500'
                              }`} />
                              <div>
                                <p className="font-medium">
                                  {item.name} is {parseFloat(String(item.current_stock)) === 0 ? 'out of stock' : 'running low'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Current: {item.current_stock} {item.unit_of_measurement} • Min: {item.min_stock_level} {item.unit_of_measurement}
                                </p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleReorderItem(item.id, parseFloat(String(item.current_stock)) === 0)}
                            >
                              {parseFloat(String(item.current_stock)) === 0 ? 'Urgent Reorder' : 'Reorder'}
                            </Button>
                          </div>
                        ))}
                      {filteredInventoryItems.filter(item => 
                        parseFloat(String(item.current_stock)) <= parseFloat(String(item.min_stock_level))
                      ).length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No low stock alerts at the moment.</p>
                        </div>
                      )}
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