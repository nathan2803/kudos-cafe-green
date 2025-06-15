import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { MessageSquare, ChevronDown, ChevronUp, Send, Clock, User, AlertTriangle } from 'lucide-react'

interface OrderMessage {
  id: string
  order_id: string
  sender_id: string
  recipient_id?: string | null
  subject?: string | null
  message: string
  message_type: string
  is_read: boolean
  is_urgent: boolean
  created_at: string
  updated_at: string
  cancellation_reason?: string | null
  parent_message_id?: string | null
  profiles?: {
    full_name: string
    email: string
    is_admin: boolean
  } | null
}

interface Order {
  id: string
  order_number?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  status: string
  total_amount: number
  user_id: string
}

interface OrderMessagingProps {
  order: Order
  onMessageSent?: () => void
}

const MESSAGE_TEMPLATES = {
  confirmation: "Your order has been confirmed and is being prepared. We'll notify you when it's ready!",
  ready_pickup: "Your order is ready for pickup! Please come to the restaurant at your convenience.",
  ready_delivery: "Your order is ready and out for delivery. Expected delivery time: 30-45 minutes.",
  delay: "We're experiencing a slight delay with your order. We apologize for the inconvenience and expect to have it ready soon.",
  cancellation: "Unfortunately, we need to cancel your order due to unforeseen circumstances. We sincerely apologize for the inconvenience.",
  custom: ""
}

export const OrderMessaging = ({ order, onMessageSent }: OrderMessagingProps) => {
  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<OrderMessage[]>([])
  const [messageContent, setMessageContent] = useState('')
  const [messageType, setMessageType] = useState<string>('general')
  const [messageTemplate, setMessageTemplate] = useState<string>('custom')
  const [isUrgent, setIsUrgent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchingMessages, setFetchingMessages] = useState(false)

  const unreadCount = messages.filter(msg => !msg.is_read && msg.sender_id !== user?.id).length

  useEffect(() => {
    if (isOpen) {
      fetchMessages()
    }
  }, [isOpen])

  const fetchMessages = async () => {
    setFetchingMessages(true)
    try {
      const { data, error } = await supabase
        .from('order_messages')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Fetch profile information separately for each message
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (msg: any) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email, is_admin')
            .eq('user_id', msg.sender_id)
            .single()
          
          return {
            ...msg,
            profiles: profileData
          }
        })
      )
      
      setMessages(messagesWithProfiles as OrderMessage[])
    } catch (error: any) {
      console.error('Error fetching messages:', error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      })
    } finally {
      setFetchingMessages(false)
    }
  }

  const sendMessage = async () => {
    if (!messageContent.trim() || !user?.id) return

    setLoading(true)
    try {
      const messageData = {
        order_id: order.id,
        sender_id: user.id,
        recipient_id: order.user_id,
        message: messageContent.trim(),
        message_type: messageType as any,
        is_urgent: isUrgent,
        subject: getSubjectFromTemplate(messageTemplate)
      }

      const { error } = await supabase
        .from('order_messages')
        .insert([messageData])

      if (error) throw error

      // Reset form
      setMessageContent('')
      setMessageTemplate('custom')
      setIsUrgent(false)
      
      // Refresh messages
      await fetchMessages()
      
      // Call callback
      onMessageSent?.()

      toast({
        title: "Message sent",
        description: "Your message has been sent to the customer",
      })
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('order_messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .eq('recipient_id', user?.id)
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ))
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const getSubjectFromTemplate = (template: string) => {
    switch (template) {
      case 'confirmation': return 'Order Confirmation'
      case 'ready_pickup': return 'Order Ready for Pickup'
      case 'ready_delivery': return 'Order Out for Delivery'
      case 'delay': return 'Order Delay Notice'
      case 'cancellation': return 'Order Cancellation'
      default: return 'Order Update'
    }
  }

  const handleTemplateChange = (template: string) => {
    setMessageTemplate(template)
    if (template !== 'custom') {
      setMessageContent(MESSAGE_TEMPLATES[template as keyof typeof MESSAGE_TEMPLATES])
    } else {
      setMessageContent('')
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <MessageSquare className="w-4 h-4 mr-2" />
          Messages
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Customer Communication
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              <p><strong>Customer:</strong> {order.customer_name}</p>
              <p><strong>Email:</strong> {order.customer_email}</p>
              {order.customer_phone && <p><strong>Phone:</strong> {order.customer_phone}</p>}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Message History */}
            {fetchingMessages ? (
              <div className="text-center py-4">Loading messages...</div>
            ) : messages.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg border ${
                      message.profiles?.is_admin 
                        ? 'bg-blue-50 border-blue-200 ml-6' 
                        : 'bg-gray-50 border-gray-200 mr-6'
                    }`}
                    onClick={() => !message.is_read && message.recipient_id === user?.id && markMessageAsRead(message.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {message.profiles?.is_admin ? (
                          <User className="w-4 h-4 text-blue-600" />
                        ) : (
                          <User className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="font-medium text-sm">
                          {message.profiles?.is_admin ? 'Admin' : order.customer_name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-auto">
                        {message.is_urgent && (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        )}
                        {!message.is_read && message.recipient_id === user?.id && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    {message.subject && (
                      <div className="font-medium text-sm mb-1">{message.subject}</div>
                    )}
                    
                    <div className="text-sm">{message.message}</div>
                    
                    {message.message_type !== 'general' && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {message.message_type.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No messages yet. Send the first message to the customer.
              </div>
            )}

            {/* Message Composition */}
            <div className="space-y-3 pt-4 border-t">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Template</label>
                  <Select value={messageTemplate} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmation">Order Confirmation</SelectItem>
                      <SelectItem value="ready_pickup">Ready for Pickup</SelectItem>
                      <SelectItem value="ready_delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delay">Delay Notice</SelectItem>
                      <SelectItem value="cancellation">Cancellation Notice</SelectItem>
                      <SelectItem value="custom">Custom Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message Type</label>
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Update</SelectItem>
                      <SelectItem value="admin_response">Admin Response</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message to the customer..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="rounded"
                  />
                  Mark as urgent
                </label>
              </div>

              <Button 
                onClick={sendMessage}
                disabled={!messageContent.trim() || loading}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}