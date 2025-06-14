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
          sender:profiles!order_messages_sender_id_fkey(full_name, email),
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

      setMessages(data || [])
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
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4" />
          <p>Messages panel ready for customer communications</p>
        </div>
      </CardContent>
    </Card>
  )
}