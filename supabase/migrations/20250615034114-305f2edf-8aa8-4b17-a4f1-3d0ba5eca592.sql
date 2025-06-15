-- Enhance order_messages table for conversation threading and recipient tracking
ALTER TABLE public.order_messages 
ADD COLUMN parent_message_id UUID REFERENCES public.order_messages(id),
ADD COLUMN recipient_id UUID;

-- Add index for better performance on conversation threads
CREATE INDEX idx_order_messages_parent ON public.order_messages(parent_message_id);
CREATE INDEX idx_order_messages_recipient ON public.order_messages(recipient_id);

-- Update RLS policies to allow customers to see admin responses to their messages
DROP POLICY IF EXISTS "Users can view messages for their orders" ON public.order_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.order_messages;
DROP POLICY IF EXISTS "Users can create messages for their orders" ON public.order_messages;
DROP POLICY IF EXISTS "Admins can create messages" ON public.order_messages;

-- Enable RLS
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

-- Customers can view messages where they are sender, recipient, or it's for their order
CREATE POLICY "Users can view their messages" 
ON public.order_messages 
FOR SELECT 
USING (
  auth.uid() = sender_id 
  OR auth.uid() = recipient_id 
  OR EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_messages.order_id 
    AND o.user_id = auth.uid()
  )
);

-- Customers can create messages for their own orders
CREATE POLICY "Users can create messages for their orders" 
ON public.order_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_messages.order_id 
    AND o.user_id = auth.uid()
  )
  AND auth.uid() = sender_id
);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages" 
ON public.order_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.is_admin = true
  )
);

-- Admins can create messages
CREATE POLICY "Admins can create messages" 
ON public.order_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.is_admin = true
  )
  AND auth.uid() = sender_id
);

-- Admins can update messages (mark as read, etc.)
CREATE POLICY "Admins can update messages" 
ON public.order_messages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.is_admin = true
  )
);

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update their messages" 
ON public.order_messages 
FOR UPDATE 
USING (
  auth.uid() = sender_id 
  OR auth.uid() = recipient_id 
  OR EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_messages.order_id 
    AND o.user_id = auth.uid()
  )
);