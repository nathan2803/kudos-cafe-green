import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { 
  Mail, 
  MessageSquare,
  Clock, 
  Package,
  Send,
  User,
  AlertTriangle
} from 'lucide-react'

interface OrderMessage {
  id: string
  order_id: string
  sender_id: string
  recipient_id?: string
  parent_message_id?: string
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
    is_admin?: boolean
  } | null
  order?: {
    order_number: string
    total_amount: number
    status: string
    created_at: string
  }
  replies?: OrderMessage[]
}

interface ConversationThread {
  order_id: string
  order_number: string
  messages: OrderMessage[]
  lastMessageAt: string
  hasUnread: boolean
}

export const MessagesInbox = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ConversationThread[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (user) {
      fetchMessages()
      setupRealtimeSubscription()
    }
  }, [user])

  const fetchMessages = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data: messages, error } = await supabase
        .from('order_messages')
        .select(`
          *,
          order:orders(
            order_number,
            total_amount,
            status,
            created_at
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch sender profiles for each message
      const messagesWithSenders = await Promise.all(
        (messages || []).map(async (message: any) => {
          const { data: senderData } = await supabase
            .from('profiles')
            .select('full_name, email, is_admin')
            .eq('user_id', message.sender_id)
            .maybeSingle()

          return {
            ...message,
            sender: senderData
          } as OrderMessage
        })
      )

      // Group messages by order_id into conversation threads
      const conversationMap = new Map<string, ConversationThread>()
      
      messagesWithSenders.forEach(message => {
        const orderId = message.order_id
        if (!conversationMap.has(orderId)) {
          conversationMap.set(orderId, {
            order_id: orderId,
            order_number: message.order?.order_number || `Order #${orderId.slice(0, 8)}`,
            messages: [],
            lastMessageAt: message.created_at,
            hasUnread: false
          })
        }
        
        const conversation = conversationMap.get(orderId)!
        conversation.messages.push(message)
        
        // Check if this is newer than current last message
        if (new Date(message.created_at) > new Date(conversation.lastMessageAt)) {
          conversation.lastMessageAt = message.created_at
        }
        
        // Check for unread messages
        if (!message.is_read && message.sender_id !== user.id) {
          conversation.hasUnread = true
        }
      })

      // Sort conversations by last message time and sort messages within each conversation
      const sortedConversations = Array.from(conversationMap.values())
        .map(conv => ({
          ...conv,
          messages: conv.messages.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        }))
        .sort((a, b) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        )

      setConversations(sortedConversations)
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

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('order_messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_messages'
        },
        () => {
          fetchMessages() // Refresh messages when any change occurs
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendReply = async (orderId: string, parentMessageId?: string) => {
    if (!user || !replyText.trim()) return

    setSending(true)
    try {
      // Find the conversation to get admin user_id for recipient
      const conversation = conversations.find(c => c.order_id === orderId)
      const lastAdminMessage = conversation?.messages
        .reverse()
        .find(m => m.sender?.is_admin)
      
      const { error } = await supabase
        .from('order_messages')
        .insert({
          order_id: orderId,
          sender_id: user.id,
          recipient_id: lastAdminMessage?.sender_id, // Reply to the admin who sent the last message
          parent_message_id: parentMessageId,
          message_type: 'customer_response',
          subject: parentMessageId ? 'Re: Customer Response' : 'Customer Message',
          message: replyText
        })

      if (error) throw error

      toast({
        title: "Reply sent",
        description: "Your message has been sent to the restaurant."
      })

      setReplyText('')
      setSelectedConversation(null)
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

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('order_messages')
        .update({ is_read: true })
        .eq('id', messageId)
      
      fetchMessages()
    } catch (error) {
      console.error('Error marking message as read:', error)
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
          <Mail className="w-5 h-5 text-primary" />
          <span>My Messages</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {conversations.length > 0 ? (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div key={conversation.order_id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {conversation.order_number}
                      </h3>
                      {conversation.hasUnread && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''} • 
                      Last updated {formatDistanceToNow(new Date(conversation.lastMessageAt))} ago
                    </p>
                  </div>
                </div>

                {/* Messages in conversation */}
                <div className="space-y-3 mb-4">
                  {conversation.messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`p-3 rounded border ${
                        message.sender?.is_admin 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-muted border-border'
                      } ${!message.is_read && message.sender_id !== user?.id ? 'ring-2 ring-primary/30' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          <span className="text-sm font-medium">
                            {message.sender?.is_admin ? 'Restaurant Staff' : 'You'}
                          </span>
                          {message.is_urgent && (
                            <AlertTriangle className="w-3 h-3 text-orange-600" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(message.created_at))} ago
                        </span>
                      </div>
                      
                      {message.subject && (
                        <p className="text-sm font-medium mb-1">{message.subject}</p>
                      )}
                      
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      
                      {message.cancellation_reason && (
                        <div className="mt-2 pt-2 border-t border-yellow-300 bg-yellow-50 rounded p-2">
                          <p className="text-sm"><strong>Reason:</strong> {message.cancellation_reason}</p>
                        </div>
                      )}

                      {!message.is_read && message.sender_id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(message.id)}
                          className="mt-2 text-xs"
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reply button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedConversation(conversation.order_id)}
                  className="flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  Reply
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-4" />
            <p>No messages yet</p>
          </div>
        )}

        {/* Reply Modal */}
        {selectedConversation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md">
              <h3 className="font-semibold mb-4">
                Reply to Restaurant
              </h3>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your message..."
                className="mb-4"
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedConversation(null)
                    setReplyText('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => sendReply(selectedConversation)}
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