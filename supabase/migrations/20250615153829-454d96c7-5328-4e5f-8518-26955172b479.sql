-- Add RLS policy for admins to delete messages
CREATE POLICY "Admins can delete messages" 
ON public.order_messages 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_admin = true
  )
);