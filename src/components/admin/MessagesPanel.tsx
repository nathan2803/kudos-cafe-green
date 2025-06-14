import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
  XCircle
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

export const MessagesPanel = () => {
  const { toast } = useToast()
  const [messages, setMessages] = useState<OrderMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<OrderMessage | null>(null)
  const [replyText, setReplyText] = useState('')
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

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    setSending(true)
    try {
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser.user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('order_messages')
        .insert({
          order_id: selectedMessage.order_id,
          sender_id: currentUser.user.id,
          message_type: 'admin_response',
          subject: `Re: ${selectedMessage.subject || 'Order Inquiry'}`,
          message: replyText
        })

      if (error) throw error

      toast({
        title: "Reply sent",
        description: "Your response has been sent to the customer."
      })

      setReplyText('')
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
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span>Customer Messages</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`border rounded-lg p-4 ${
                  message.is_urgent ? 'border-red-300 bg-red-50' : 'border-border'
                } ${!message.is_read ? 'bg-blue-50 border-blue-300' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">
                        {message.subject || 'Customer Message'}
                      </h3>
                      {message.is_urgent && (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      {!message.is_read && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {message.sender?.full_name || 'Customer'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {message.order?.order_number}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(message.created_at))} ago
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {message.message_type === 'cancellation_request' && (
                      <div className="text-sm">
                        <p className="font-semibold text-red-600">Cancellation Request</p>
                        {message.order && (
                          <p className="text-muted-foreground">
                            ₱{message.order.total_amount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white rounded p-3 border">
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  </div>

                  {message.message_type === 'cancellation_request' && message.order && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Order Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Customer:</strong> {message.order.customer_name}</p>
                          <p><strong>Email:</strong> {message.order.customer_email}</p>
                          <p><strong>Order Type:</strong> {message.order.order_type.replace('_', ' ')}</p>
                          <p><strong>Status:</strong> {message.order.status}</p>
                        </div>
                        <div>
                          <p><strong>Total Amount:</strong> ₱{message.order.total_amount.toFixed(2)}</p>
                          <p><strong>Deposit Paid:</strong> ₱{(message.order.deposit_paid || 0).toFixed(2)}</p>
                          <p><strong>Order Date:</strong> {formatDistanceToNow(new Date(message.order.created_at))} ago</p>
                        </div>
                      </div>
                      {message.cancellation_reason && (
                        <div className="mt-2 pt-2 border-t border-yellow-300">
                          <p><strong>Cancellation Reason:</strong> {message.cancellation_reason}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Deny
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
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