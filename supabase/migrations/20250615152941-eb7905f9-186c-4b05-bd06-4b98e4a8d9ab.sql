-- Make order_id and sender_id nullable for contact inquiries
ALTER TABLE public.order_messages 
ALTER COLUMN order_id DROP NOT NULL,
ALTER COLUMN sender_id DROP NOT NULL;

-- Update message_type constraint to include all existing types plus contact_inquiry
ALTER TABLE public.order_messages 
DROP CONSTRAINT IF EXISTS order_messages_message_type_check;

ALTER TABLE public.order_messages 
ADD CONSTRAINT order_messages_message_type_check 
CHECK (message_type IN ('cancellation_request', 'admin_response', 'customer_response', 'general', 'contact_inquiry'));

-- Drop the incomplete policy from the previous migration and create complete ones
DROP POLICY IF EXISTS "Allow anonymous contact inquiries" ON public.order_messages;
DROP POLICY IF EXISTS "Users can view their messages" ON public.order_messages;
DROP POLICY IF EXISTS "Users can create messages for their orders" ON public.order_messages;

-- Recreate comprehensive policies with proper NULL handling
CREATE POLICY "Users can view their messages" 
ON public.order_messages 
FOR SELECT 
USING (
  -- Users can see messages for their orders
  (order_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_messages.order_id 
    AND orders.user_id = auth.uid()
  ))
  OR 
  -- Admins can see all messages including contact inquiries
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Users can create messages for their orders" 
ON public.order_messages 
FOR INSERT 
WITH CHECK (
  -- Regular order messages: user must be sender and own the order
  (order_id IS NOT NULL AND sender_id IS NOT NULL AND auth.uid() = sender_id 
   AND EXISTS (
     SELECT 1 FROM public.orders 
     WHERE orders.id = order_messages.order_id 
     AND orders.user_id = auth.uid()
   ))
  OR 
  -- Contact inquiries: anonymous users, no order, no sender
  (message_type = 'contact_inquiry' AND sender_id IS NULL AND order_id IS NULL)
  OR 
  -- Admin messages: admins can create any message
  (sender_id IS NOT NULL AND auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_admin = true
  ))
);