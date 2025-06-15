-- Allow anonymous users to insert contact inquiries (sender_id is null)
CREATE POLICY "Allow anonymous contact inquiries" 
ON public.order_messages 
FOR INSERT 
WITH CHECK (
  message_type = 'contact_inquiry' 
  AND sender_id IS NULL 
  AND order_id IS NULL
);