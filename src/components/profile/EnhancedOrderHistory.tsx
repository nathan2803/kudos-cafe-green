import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { 
  Package, 
  MapPin, 
  Filter, 
  RefreshCw, 
  X, 
  AlertTriangle,
  Clock,
  DollarSign 
} from 'lucide-react'

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

interface EnhancedOrderHistoryProps {
  orders: Order[]
  loading: boolean
  onRefresh: () => void
}

export const EnhancedOrderHistory = ({ orders, loading, onRefresh }: EnhancedOrderHistoryProps) => {
  const { toast } = useToast()
  const [orderFilter, setOrderFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [refundDetails, setRefundDetails] = useState('')

  const cancellationReasons = [
    'Change of plans',
    'Found better option elsewhere',
    'Emergency situation',
    'Wrong order placed',
    'Pricing concerns',
    'Location/timing issues',
    'Other (please specify)'
  ]

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateRefundAmount = (order: Order) => {
    const now = new Date()
    const orderTime = new Date(order.created_at)
    const timeDiff = Math.abs(now.getTime() - orderTime.getTime())
    const minutesDiff = Math.floor(timeDiff / (1000 * 60))
    
    // If cancelled within 30 minutes, only 35% refund
    if (minutesDiff <= 30) {
      return (order.deposit_paid || order.total_amount) * 0.35
    }
    // Otherwise full refund
    return order.deposit_paid || order.total_amount
  }

  const getRefundWarning = (order: Order) => {
    const now = new Date()
    const orderTime = new Date(order.created_at)
    const timeDiff = Math.abs(now.getTime() - orderTime.getTime())
    const minutesDiff = Math.floor(timeDiff / (1000 * 60))
    
    if (minutesDiff <= 30) {
      return `⚠️ Cancelling within 30 minutes of order time. Only 35% refund (₱${calculateRefundAmount(order).toFixed(2)}) will be processed.`
    }
    return `✅ Full refund (₱${calculateRefundAmount(order).toFixed(2)}) will be processed.`
  }

  const handleCancelOrder = async (order: Order) => {
    if (!cancellationReason) {
      toast({
        title: "Error",
        description: "Please select a cancellation reason",
        variant: "destructive"
      })
      return
    }

    if (cancellationReason === 'Other (please specify)' && !customReason.trim()) {
      toast({
        title: "Error", 
        description: "Please provide details for your cancellation reason",
        variant: "destructive"
      })
      return
    }

    if (!refundDetails.trim()) {
      toast({
        title: "Error",
        description: "Please provide your refund details",
        variant: "destructive"
      })
      return
    }

    try {
      const finalReason = cancellationReason === 'Other (please specify)' ? customReason : cancellationReason
      const refundAmount = calculateRefundAmount(order)

      // Create cancellation message
      const { error: messageError } = await supabase
        .from('order_messages')
        .insert({
          order_id: order.id,
          sender_id: order.user_id,
          message_type: 'cancellation_request',
          subject: `Cancellation Request - ${order.order_number}`,
          message: `Customer has requested to cancel this order.

Reason: ${finalReason}

Refund Amount: ₱${refundAmount.toFixed(2)}

Refund Details:
${refundDetails}`,
          cancellation_reason: finalReason,
          is_urgent: true
        })

      if (messageError) throw messageError

      toast({
        title: "Cancellation Request Sent",
        description: "Your cancellation request has been sent to the restaurant. They will review and process your request.",
      })

      setCancellingOrder(null)
      setCancellationReason('')
      setCustomReason('')
      setRefundDetails('')
      onRefresh()

    } catch (error) {
      console.error('Error sending cancellation request:', error)
      toast({
        title: "Error",
        description: "Failed to send cancellation request. Please try again or contact support.",
        variant: "destructive"
      })
    }
  }

  const handleReorder = async (order: Order) => {
    try {
      // Send reorder confirmation message to admin
      const { error: messageError } = await supabase
        .from('order_messages')
        .insert({
          order_id: order.id,
          sender_id: order.user_id,
          message_type: 'reorder_request',
          subject: `Reorder Request - ${order.order_number}`,
          message: `Customer has requested to reorder this order.

Original Order: ${order.order_number}
Order Date: ${formatDate(order.created_at)}
Total Amount: ₱${order.total_amount.toFixed(2)}
Order Type: ${order.order_type.replace('_', ' ')}

Items:
${order.items.map(item => `${item.quantity}x ${item.name} - ₱${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Please confirm if this order can be processed again.`,
          is_urgent: false
        })

      if (messageError) throw messageError

      toast({
        title: "Reorder Request Sent",
        description: "Your reorder request has been sent to the restaurant for confirmation.",
      })
    } catch (error) {
      console.error('Error sending reorder request:', error)
      toast({
        title: "Error",
        description: "Failed to send reorder request. Please try again.",
        variant: "destructive"
      })
    }
  }

  const canCancelOrder = (order: Order) => {
    return order.status === 'pending' || order.status === 'confirmed'
  }

  const canReorder = (order: Order) => {
    return order.status === 'delivered' || order.status === 'cancelled'
  }

  const filteredOrders = orders.filter(order => {
    if (orderFilter === 'all') return true
    return order.status === orderFilter
  })

  const sortedOrders = filteredOrders.sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'amount_high':
        return b.total_amount - a.total_amount
      case 'amount_low':
        return a.total_amount - b.total_amount
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-primary" />
            <span>Order History</span>
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={orderFilter} onValueChange={setOrderFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="amount_high">Amount: High to Low</SelectItem>
                <SelectItem value="amount_low">Amount: Low to High</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : sortedOrders.length > 0 ? (
          <div className="space-y-4">
            {sortedOrders.map((order) => (
              <div key={order.id} className="border border-primary/20 rounded-lg p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-3">
                  <div className="flex items-center space-x-4 mb-2 lg:mb-0">
                    <div>
                      <p className="font-semibold">
                        {order.order_number || `Order #${order.id.slice(0, 8)}`}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <div className="text-right">
                      <p className="font-semibold text-lg flex items-center">
                        <DollarSign className="w-4 h-4" />
                        ₱{order.total_amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {order.order_type.replace('_', ' ')}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {canReorder(order) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReorder(order)}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Reorder
                        </Button>
                      )}
                      
                      {canCancelOrder(order) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => setCancellingOrder(order.id)}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center space-x-2">
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                                <span>Cancel Order</span>
                              </AlertDialogTitle>
                              <AlertDialogDescription className="space-y-4">
                                <p>Are you sure you want to cancel order {order.order_number}?</p>
                                
                                <div className="p-3 bg-muted rounded-lg">
                                  <p className="text-sm font-medium mb-2">Refund Information:</p>
                                  <p className="text-sm">{getRefundWarning(order)}</p>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="reason">Cancellation Reason *</Label>
                                  <Select value={cancellationReason} onValueChange={setCancellationReason}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {cancellationReasons.map((reason) => (
                                        <SelectItem key={reason} value={reason}>
                                          {reason}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                {cancellationReason === 'Other (please specify)' && (
                                  <div className="space-y-2">
                                    <Label htmlFor="customReason">Please specify</Label>
                                    <Textarea
                                      id="customReason"
                                      value={customReason}
                                      onChange={(e) => setCustomReason(e.target.value)}
                                      placeholder="Please provide details..."
                                      className="min-h-[80px]"
                                    />
                                  </div>
                                 )}
                                 
                                 <div className="space-y-2">
                                   <Label htmlFor="refundDetails">Refund Details *</Label>
                                   <Textarea
                                     id="refundDetails"
                                     value={refundDetails}
                                     onChange={(e) => setRefundDetails(e.target.value)}
                                     placeholder="Please provide your refund details (e.g., GCash number, bank account, or preferred refund method)..."
                                     className="min-h-[80px]"
                                   />
                                 </div>
                               </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => {
                                setCancellingOrder(null)
                                setCancellationReason('')
                                setCustomReason('')
                              }}>
                                Keep Order
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleCancelOrder(order)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Cancel Order
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
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
            <p className="text-muted-foreground">
              {orderFilter === 'all' 
                ? "No orders yet. Start exploring our menu!" 
                : `No ${orderFilter} orders found.`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
