import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { 
  MessageSquare, 
  AlertTriangle, 
  Clock, 
  User, 
  DollarSign,
  Check,
  X,
  Send,
  RefreshCw 
} from 'lucide-react'

interface OrderMessage {
  id: string
  order_id: string
  sender_id: string
  message_type: 'cancellation_request' | 'admin_response' | 'general'
  subject: string
  message: string
  cancellation_reason?: string
  is_read: boolean
  is_urgent: boolean
  created_at: string
  updated_at: string
  order?: {
    order_number: string
    total_amount: number
    status: string
    customer_name?: string
    customer_email?: string
    created_at: string
  }
  sender?: {
    full_name: string
    email: string
  }
}

export const MessagesPanel = () => {
  const { toast } = useToast()
  const [messages, setMessages] = useState<OrderMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<OrderMessage | null>(null)
  const [responseText, setResponseText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('order_messages')
        .select(`
          *,
          order:orders (
            order_number,
            total_amount,
            status,
            customer_name,
            customer_email,
            created_at
          ),
          sender:profiles!order_messages_sender_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const transformedData = (data || []).map(item => ({
        ...item,
        message_type: item.message_type as 'cancellation_request' | 'admin_response' | 'general',
        sender: item.sender && typeof item.sender === 'object' && item.sender !== null && 'full_name' in item.sender 
          ? item.sender as { full_name: string; email: string }
          : undefined
      }))
      setMessages(transformedData as OrderMessage[])
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

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('order_messages')
        .update({ is_read: true })
        .eq('id', messageId)

      if (error) throw error

      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      )
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const sendResponse = async () => {
    if (!selectedMessage || !responseText.trim()) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('order_messages')
        .insert({
          order_id: selectedMessage.order_id,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          message_type: 'admin_response',
          subject: `Re: ${selectedMessage.subject}`,
          message: responseText,
          is_urgent: false
        })

      if (error) throw error

      toast({
        title: "Response Sent",
        description: "Your response has been sent to the customer",
      })

      setResponseText('')
      fetchMessages()
    } catch (error) {
      console.error('Error sending response:', error)
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive"
      })
    } finally {
      setSending(false)
    }
  }

  const approveRefund = async (message: OrderMessage) => {
    try {
      // Update order status and payment
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          payment_status: 'refunded'
        })
        .eq('id', message.order_id)

      if (orderError) throw orderError

      // Send confirmation message
      const { error: messageError } = await supabase
        .from('order_messages')
        .insert({
          order_id: message.order_id,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          message_type: 'admin_response',
          subject: `Refund Approved - ${message.order?.order_number}`,
          message: `Your cancellation has been approved and the refund has been processed. You should see the refund in your account within 3-5 business days.`,
          is_urgent: false
        })

      if (messageError) throw messageError

      toast({
        title: "Refund Approved",
        description: "The cancellation has been approved and refund processed",
      })

      fetchMessages()
    } catch (error) {
      console.error('Error approving refund:', error)
      toast({
        title: "Error",
        description: "Failed to approve refund",
        variant: "destructive"
      })
    }
  }

  const denyRefund = async (message: OrderMessage) => {
    try {
      // Send denial message
      const { error: messageError } = await supabase
        .from('order_messages')
        .insert({
          order_id: message.order_id,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          message_type: 'admin_response',
          subject: `Cancellation Request Denied - ${message.order?.order_number}`,
          message: `Your cancellation request has been reviewed and denied. Your order is already being prepared. Please contact us directly if you have any concerns.`,
          is_urgent: false
        })

      if (messageError) throw messageError

      toast({
        title: "Cancellation Denied",
        description: "The cancellation request has been denied",
      })

      fetchMessages()
    } catch (error) {
      console.error('Error denying refund:', error)
      toast({
        title: "Error",
        description: "Failed to deny cancellation",
        variant: "destructive"
      })
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

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'cancellation_request':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'admin_response':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const unreadMessages = messages.filter(msg => !msg.is_read)
  const urgentMessages = messages.filter(msg => msg.is_urgent && !msg.is_read)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Messages</p>
                <p className="text-2xl font-bold">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Unread</p>
                <p className="text-2xl font-bold text-orange-500">{unreadMessages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Urgent</p>
                <p className="text-2xl font-bold text-red-500">{urgentMessages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span>Messages</span>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={fetchMessages}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : messages.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-muted' : ''
                      } ${!message.is_read ? 'border-l-4 border-l-primary' : ''}`}
                      onClick={() => {
                        setSelectedMessage(message)
                        if (!message.is_read) {
                          markAsRead(message.id)
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getMessageTypeColor(message.message_type)}>
                            {message.message_type === 'cancellation_request' ? 'Cancel Request' : 'Response'}
                          </Badge>
                          {message.is_urgent && (
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                      
                      <p className="font-medium text-sm truncate">{message.subject}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {message.sender?.full_name} - {message.order?.order_number}
                      </p>
                      
                      {!message.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No messages yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-primary" />
                      <span>{selectedMessage.subject}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      From: {selectedMessage.sender?.full_name} ({selectedMessage.sender?.email})
                    </p>
                  </div>
                  <Badge className={getMessageTypeColor(selectedMessage.message_type)}>
                    {selectedMessage.message_type === 'cancellation_request' ? 'Cancel Request' : 'Response'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Order Details */}
                {selectedMessage.order && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Order Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Order Number:</span>
                        <p>{selectedMessage.order.order_number}</p>
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span>
                        <p className="flex items-center">
                          <DollarSign className="w-3 h-3" />
                          ₱{selectedMessage.order.total_amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <p className="capitalize">{selectedMessage.order.status}</p>
                      </div>
                      <div>
                        <span className="font-medium">Order Date:</span>
                        <p>{formatDate(selectedMessage.order.created_at)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message Content */}
                <div>
                  <h4 className="font-semibold mb-2">Message</h4>
                  <div className="bg-background border rounded-lg p-4">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                  
                  {selectedMessage.cancellation_reason && (
                    <div className="mt-3">
                      <span className="font-medium text-sm">Cancellation Reason:</span>
                      <p className="text-sm text-muted-foreground">{selectedMessage.cancellation_reason}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Quick Actions for Cancellation Requests */}
                {selectedMessage.message_type === 'cancellation_request' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Quick Actions</h4>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => approveRefund(selectedMessage)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve Refund
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => denyRefund(selectedMessage)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Deny Cancellation
                      </Button>
                    </div>
                  </div>
                )}

                {/* Response Section */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Send Response</h4>
                  <div className="space-y-2">
                    <Label htmlFor="response">Your Response</Label>
                    <Textarea
                      id="response"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Type your response here..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button 
                    onClick={sendResponse}
                    disabled={!responseText.trim() || sending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sending ? 'Sending...' : 'Send Response'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a message to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}