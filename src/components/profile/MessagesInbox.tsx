import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
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
  AlertTriangle,
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
  const [sortBy, setSortBy] = useState<'date' | 'order'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set())
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    if (user) {
      fetchMessages()
      const cleanup = setupRealtimeSubscription()
      return cleanup
    }
  }, [user, showArchived])

  useEffect(() => {
    // Auto-expand all conversations by default
    if (conversations.length > 0) {
      setExpandedConversations(new Set(conversations.map(c => c.order_id)))
    }
  }, [conversations.length])

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
        .eq('archived', showArchived)
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
        if (!orderId) return // Skip messages without order_id (like contact inquiries)
        
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

      // Sort conversations and messages within each conversation
      const sortedConversations = Array.from(conversationMap.values())
        .map(conv => ({
          ...conv,
          messages: conv.messages.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        }))

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
          fetchMessages()
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
      const conversation = conversations.find(c => c.order_id === orderId)
      const lastAdminMessage = conversation?.messages
        .reverse()
        .find(m => m.sender?.is_admin)
      
      const { error } = await supabase
        .from('order_messages')
        .insert({
          order_id: orderId,
          sender_id: user.id,
          recipient_id: lastAdminMessage?.sender_id,
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

  const archiveConversation = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('order_messages')
        .update({ archived: true })
        .eq('order_id', orderId)
        .eq('sender_id', user?.id)
      
      if (error) throw error
      
      toast({
        title: "Conversation archived",
        description: "This conversation has been archived and will no longer appear in your inbox."
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
        .eq('sender_id', user?.id)
      
      if (error) throw error
      
      toast({
        title: "Conversation unarchived",
        description: "This conversation has been moved back to your inbox."
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

  const getSortedConversations = () => {
    let sorted = [...conversations]
    
    if (sortBy === 'date') {
      sorted = sorted.sort((a, b) => {
        const dateA = new Date(a.lastMessageAt).getTime()
        const dateB = new Date(b.lastMessageAt).getTime()
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      })
    } else if (sortBy === 'order') {
      sorted = sorted.sort((a, b) => {
        const comparison = a.order_number.localeCompare(b.order_number)
        return sortOrder === 'desc' ? -comparison : comparison
      })
    }
    
    return sorted
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
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-primary" />
            <span>My Messages</span>
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
        {getSortedConversations().length > 0 ? (
          <div className="space-y-4">
            {getSortedConversations().map((conversation) => {
              const isExpanded = expandedConversations.has(conversation.order_id)
              
              return (
                <div key={conversation.order_id} className="border rounded-lg p-4">
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

                  {/* Messages in conversation - only show when expanded */}
                  {isExpanded && (
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
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(message.created_at))} ago
                              </span>
                            </div>
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
                  )}

                   {/* Reply and Archive/Unarchive buttons - always visible */}
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       {!showArchived && (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => setSelectedConversation(conversation.order_id)}
                           className="flex items-center gap-1"
                         >
                           <MessageSquare className="w-3 h-3" />
                           Reply
                         </Button>
                       )}
                       
                       {showArchived ? (
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button
                               variant="outline"
                               size="sm"
                               className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                             >
                               <ArchiveRestore className="w-3 h-3" />
                               Unarchive
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
                               variant="outline"
                               size="sm"
                               className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                             >
                               <Archive className="w-3 h-3" />
                               Archive
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
                     
                     {!isExpanded && (
                       <span className="text-xs text-muted-foreground">
                         Click to expand {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                       </span>
                     )}
                   </div>
                </div>
              )
            })}
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