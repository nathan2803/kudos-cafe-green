import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { 
  MessageSquare, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  User,
  Package,
  Send,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Archive,
  ArchiveRestore,
  SortAsc,
  SortDesc,
  Calendar,
  Hash,
  Inbox
} from 'lucide-react'

interface OrderMessage {
  id: string
  order_id: string
  sender_id: string
  message_type: string
  subject?: string
  message: string
  cancellation_reason?: string
  is_read: boolean
  is_urgent: boolean
  created_at: string
  sender?: {
    full_name: string
    email: string
  } | null
  order?: {
    order_number: string
    total_amount: number
    status: string
    deposit_paid: number
    customer_name: string
    customer_email: string
    order_type: string
    created_at: string
  }
}

interface OrderConversation {
  order_id: string
  order: {
    order_number: string
    total_amount: number
    status: string
    deposit_paid: number
    customer_name: string
    customer_email: string
    order_type: string
    created_at: string
  }
  messages: OrderMessage[]
  latest_message_date: string
  unread_count: number
  has_urgent: boolean
}

export const MessagesPanel = () => {
  const { toast } = useToast()
  const [messages, setMessages] = useState<OrderMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<OrderMessage | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'order'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set())
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [showArchived])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('order_messages')
        .select(`
          *,
          order:orders(
            order_number,
            total_amount,
            status,
            deposit_paid,
            customer_name,
            customer_email,
            order_type,
            created_at
          )
        `)
        .eq('archived', showArchived)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch sender profiles separately to avoid foreign key issues
      const messagesWithSenders = await Promise.all(
        (data || []).map(async (message: any) => {
          const { data: senderData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', message.sender_id)
            .maybeSingle()

          return {
            ...message,
            sender: senderData
          } as OrderMessage
        })
      )

      setMessages(messagesWithSenders)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const archiveConversation = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('order_messages')
        .update({ archived: true })
        .eq('order_id', orderId)
      
      if (error) throw error
      
      toast({
        title: "Conversation archived",
        description: "This conversation has been archived."
      })
      
      fetchMessages()
    } catch (error) {
      console.error('Error archiving conversation:', error)
      toast({
        title: "Error",
        description: "Failed to archive conversation",
        variant: "destructive"
      })
    }
  }

  const unarchiveConversation = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('order_messages')
        .update({ archived: false })
        .eq('order_id', orderId)
      
      if (error) throw error
      
      toast({
        title: "Conversation unarchived",
        description: "This conversation has been moved back to the inbox."
      })
      
      fetchMessages()
    } catch (error) {
      console.error('Error unarchiving conversation:', error)
      toast({
        title: "Error",
        description: "Failed to unarchive conversation",
        variant: "destructive"
      })
    }
  }

  const toggleConversation = (orderId: string) => {
    const newExpanded = new Set(expandedConversations)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedConversations(newExpanded)
  }

  const groupMessagesByOrder = (): OrderConversation[] => {
    const grouped = messages.reduce((acc, message) => {
      // Handle contact inquiries separately
      if (message.message_type === 'contact_inquiry') {
        const inquiryKey = `inquiry_${message.id}`
        acc[inquiryKey] = {
          order_id: inquiryKey,
          order: {
            order_number: 'Contact Inquiry',
            total_amount: 0,
            status: 'inquiry',
            deposit_paid: 0,
            customer_name: 'Contact Form',
            customer_email: '',
            order_type: 'contact_inquiry',
            created_at: message.created_at
          },
          messages: [message],
          latest_message_date: message.created_at,
          unread_count: message.is_read ? 0 : 1,
          has_urgent: message.is_urgent
        }
        return acc
      }

      if (!message.order_id || !message.order) return acc
      
      if (!acc[message.order_id]) {
        acc[message.order_id] = {
          order_id: message.order_id,
          order: message.order,
          messages: [],
          latest_message_date: message.created_at,
          unread_count: 0,
          has_urgent: false
        }
      }
      
      acc[message.order_id].messages.push(message)
      
      // Update latest message date
      if (new Date(message.created_at) > new Date(acc[message.order_id].latest_message_date)) {
        acc[message.order_id].latest_message_date = message.created_at
      }
      
      // Count unread messages
      if (!message.is_read) {
        acc[message.order_id].unread_count++
      }
      
      // Check for urgent messages
      if (message.is_urgent) {
        acc[message.order_id].has_urgent = true
      }
      
      return acc
    }, {} as Record<string, OrderConversation>)
    
    return Object.values(grouped)
  }

  const getSortedConversations = () => {
    let sorted = groupMessagesByOrder()
    
    if (sortBy === 'date') {
      sorted = sorted.sort((a, b) => {
        const dateA = new Date(a.latest_message_date).getTime()
        const dateB = new Date(b.latest_message_date).getTime()
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      })
    } else if (sortBy === 'order') {
      sorted = sorted.sort((a, b) => {
        const orderA = a.order.order_number || ''
        const orderB = b.order.order_number || ''
        const comparison = orderA.localeCompare(orderB)
        return sortOrder === 'desc' ? -comparison : comparison
      })
    }
    
    return sorted
  }

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    setSending(true)
    try {
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser.user) throw new Error('Not authenticated')

      // Get the customer's user_id from the order
      const { data: orderData } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', selectedMessage.order_id)
        .single()

      const { error } = await supabase
        .from('order_messages')
        .insert({
          order_id: selectedMessage.order_id,
          sender_id: currentUser.user.id,
          recipient_id: orderData?.user_id, // Set customer as recipient
          parent_message_id: selectedMessage.id, // Link to original message
          message_type: 'admin_response',
          subject: `Re: ${selectedMessage.subject || 'Order Inquiry'}`,
          message: replyText
        })

      if (error) throw error

      // Mark the original message as read
      await supabase
        .from('order_messages')
        .update({ is_read: true })
        .eq('id', selectedMessage.id)

      toast({
        title: "Reply sent",
        description: "Your response has been sent to the customer."
      })

      setReplyText('')
      setSelectedMessage(null)
      fetchMessages()
    } catch (error) {
      console.error('Error sending reply:', error)
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive"
      })
    } finally {
      setSending(false)
    }
  }

  const approveCancellation = async (message: OrderMessage) => {
    try {
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser.user) throw new Error('Not authenticated')

      // Get order details for refund calculation
      const { data: orderData } = await supabase
        .from('orders')
        .select('user_id, deposit_paid, total_amount')
        .eq('id', message.order_id)
        .single()

      if (!orderData) throw new Error('Order not found')

      // Update order status to cancelled
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: currentUser.user.id,
          refund_amount: orderData.deposit_paid || 0
        })
        .eq('id', message.order_id)

      if (orderError) throw orderError

      // Send approval message to customer
      const { error: messageError } = await supabase
        .from('order_messages')
        .insert({
          order_id: message.order_id,
          sender_id: currentUser.user.id,
          recipient_id: orderData.user_id,
          parent_message_id: message.id,
          message_type: 'admin_response',
          subject: 'Cancellation Approved',
          message: `Your cancellation request has been approved. Your order has been cancelled and a refund of ₱${(orderData.deposit_paid || 0).toFixed(2)} will be processed.`
        })

      if (messageError) throw messageError

      // Mark original message as read
      await supabase
        .from('order_messages')
        .update({ is_read: true })
        .eq('id', message.id)

      toast({
        title: "Cancellation approved",
        description: "The order has been cancelled and the customer has been notified."
      })

      fetchMessages()
    } catch (error) {
      console.error('Error approving cancellation:', error)
      toast({
        title: "Error",
        description: "Failed to approve cancellation",
        variant: "destructive"
      })
    }
  }

  const denyCancellation = async (message: OrderMessage) => {
    try {
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser.user) throw new Error('Not authenticated')

      // Get customer's user_id from the order
      const { data: orderData } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', message.order_id)
        .single()

      if (!orderData) throw new Error('Order not found')

      // Send denial message to customer
      const { error: messageError } = await supabase
        .from('order_messages')
        .insert({
          order_id: message.order_id,
          sender_id: currentUser.user.id,
          recipient_id: orderData.user_id,
          parent_message_id: message.id,
          message_type: 'admin_response',
          subject: 'Cancellation Request Denied',
          message: 'Your cancellation request has been reviewed and cannot be approved at this time. Please contact us directly if you have any questions.'
        })

      if (messageError) throw messageError

      // Mark original message as read
      await supabase
        .from('order_messages')
        .update({ is_read: true })
        .eq('id', message.id)

      toast({
        title: "Cancellation denied",
        description: "The cancellation request has been denied and the customer has been notified."
      })

      fetchMessages()
    } catch (error) {
      console.error('Error denying cancellation:', error)
      toast({
        title: "Error",
        description: "Failed to deny cancellation",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>Customer Messages</span>
          </CardTitle>
          
          {/* View Toggle and Sorting Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant={showArchived ? "default" : "outline"}
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2"
            >
              {showArchived ? <Archive className="w-4 h-4" /> : <Inbox className="w-4 h-4" />}
              {showArchived ? "Archived" : "Inbox"}
            </Button>
            <Select value={sortBy} onValueChange={(value: 'date' | 'order') => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Date</span>
                  </div>
                </SelectItem>
                <SelectItem value="order">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    <span>Order</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : getSortedConversations().length > 0 ? (
          <div className="space-y-4">
            {getSortedConversations().map((conversation) => {
              const isExpanded = expandedConversations.has(conversation.order_id)
              const sortedMessages = conversation.messages.sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
              
              return (
              <div 
                key={conversation.order_id} 
                className={`border rounded-lg p-4 ${
                  conversation.has_urgent ? 'border-red-300 bg-red-50' : 'border-border'
                } ${conversation.unread_count > 0 ? 'bg-blue-50 border-blue-300' : ''}`}
              >
                 <div className="flex items-start justify-between mb-3">
                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => toggleConversation(conversation.order_id)}
                         className="p-1 h-auto"
                       >
                         {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                       </Button>
                       <h3 className="font-semibold text-lg">
                         {conversation.order.order_number} - {conversation.order.customer_name}
                       </h3>
                      {conversation.has_urgent && (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      {conversation.unread_count > 0 && (
                        <Badge variant="secondary" className="bg-blue-600 text-white">
                          {conversation.unread_count} new
                        </Badge>
                      )}
                    </div>
                     <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                       <span className="flex items-center gap-1">
                         <DollarSign className="w-3 h-3" />
                         ₱{conversation.order.total_amount.toFixed(2)}
                       </span>
                       <span className="flex items-center gap-1">
                         <MessageSquare className="w-3 h-3" />
                         {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                       </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(conversation.latest_message_date))} ago
                        </span>
                        
                        {showArchived ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 text-muted-foreground hover:text-foreground"
                              >
                                <ArchiveRestore className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Unarchive Conversation</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to unarchive this conversation? It will be moved back to your inbox.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => unarchiveConversation(conversation.order_id)}
                                >
                                  Unarchive Conversation
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 text-muted-foreground hover:text-foreground"
                              >
                                <Archive className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Archive Conversation</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to archive this entire conversation? It will no longer appear in your inbox.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => archiveConversation(conversation.order_id)}
                                >
                                  Archive Conversation
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                     </div>
                   </div>
                 </div>

                 {/* Conversation content - only show when expanded */}
                 {isExpanded && (
                   <div className="space-y-4 mt-4 border-t pt-4">
                      {/* Order Summary or Contact Inquiry Details */}
                      {conversation.order.order_type === 'contact_inquiry' ? (
                        <div className="bg-blue-50 rounded p-3 border border-blue-200">
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-blue-600" />
                            Contact Inquiry
                          </h4>
                          <div className="text-sm">
                            <p><strong>Type:</strong> Website Contact Form</p>
                            <p><strong>Received:</strong> {formatDistanceToNow(new Date(conversation.order.created_at))} ago</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-card rounded p-3 border">
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            Order Details
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p><strong>Customer:</strong> {conversation.order.customer_name}</p>
                              <p><strong>Email:</strong> {conversation.order.customer_email}</p>
                              <p><strong>Order Type:</strong> {conversation.order.order_type.replace('_', ' ')}</p>
                              <p><strong>Status:</strong> {conversation.order.status}</p>
                            </div>
                            <div>
                              <p><strong>Total Amount:</strong> ₱{conversation.order.total_amount.toFixed(2)}</p>
                              <p><strong>Deposit Paid:</strong> ₱{(conversation.order.deposit_paid || 0).toFixed(2)}</p>
                              <p><strong>Order Date:</strong> {formatDistanceToNow(new Date(conversation.order.created_at))} ago</p>
                            </div>
                          </div>
                        </div>
                      )}

                     {/* Messages Thread */}
                     <div className="space-y-3">
                       {sortedMessages.map((message) => (
                         <div 
                           key={message.id} 
                           className={`p-3 rounded border-l-4 ${
                             message.message_type === 'admin_response' 
                               ? 'bg-green-50 border-l-green-500 ml-4' 
                               : 'bg-gray-50 border-l-blue-500 mr-4'
                           }`}
                         >
                           <div className="flex items-start justify-between mb-2">
                             <div className="flex items-center gap-2">
                               <span className="font-medium text-sm">
                                 {message.message_type === 'admin_response' ? 'Admin' : (message.sender?.full_name || 'Customer')}
                               </span>
                                {message.message_type === 'cancellation_request' && (
                                  <Badge variant="destructive" className="text-xs">Cancellation Request</Badge>
                                )}
                                {message.message_type === 'contact_inquiry' && (
                                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">Contact Inquiry</Badge>
                                )}
                               {message.is_urgent && (
                                 <AlertTriangle className="w-3 h-3 text-red-600" />
                               )}
                               {!message.is_read && (
                                 <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">New</span>
                               )}
                             </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(message.created_at))} ago
                              </span>
                           </div>
                           
                           {message.subject && (
                             <p className="font-medium text-sm mb-1">{message.subject}</p>
                           )}
                           
                           <p className="text-sm whitespace-pre-wrap mb-2">{message.message}</p>
                           
                           {message.cancellation_reason && (
                             <div className="mt-2 pt-2 border-t border-yellow-300 bg-yellow-100 rounded p-2">
                               <p className="text-sm"><strong>Cancellation Reason:</strong> {message.cancellation_reason}</p>
                             </div>
                           )}

                           <div className="flex items-center gap-2 mt-2">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => setSelectedMessage(message)}
                               className="flex items-center gap-1"
                             >
                               <Send className="w-3 h-3" />
                               Reply
                             </Button>
                             
                              {message.message_type === 'cancellation_request' && (
                                <>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-green-600 border-green-600 hover:bg-green-50"
                                      >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Approve
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Approve Cancellation</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to approve this cancellation request? The order will be cancelled and a refund of ₱{(conversation.order.deposit_paid || 0).toFixed(2)} will be processed.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => approveCancellation(message)}
                                          className="bg-green-600 text-white hover:bg-green-700"
                                        >
                                          Approve Cancellation
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-600 hover:bg-red-50"
                                      >
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Deny
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Deny Cancellation</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to deny this cancellation request? The customer will be notified that their request cannot be approved.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => denyCancellation(message)}
                                          className="bg-red-600 text-white hover:bg-red-700"
                                        >
                                          Deny Request
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                   )}
                </div>
                )
              })}
            </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4" />
            <p>No customer messages yet</p>
          </div>
        )}

        {/* Reply Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="font-semibold mb-4">
                Reply to {selectedMessage.sender?.full_name || 'Customer'}
              </h3>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="mb-4"
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedMessage(null)
                    setReplyText('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendReply}
                  disabled={sending || !replyText.trim()}
                >
                  {sending ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}