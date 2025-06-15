-- Add RLS policy for admins to delete contact inquiries (messages with null order_id)
CREATE POLICY "Admins can delete contact inquiries" 
ON public.order_messages 
FOR DELETE 
USING (
  message_type = 'contact_inquiry' 
  AND order_id IS NULL 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_admin = true
  )
);