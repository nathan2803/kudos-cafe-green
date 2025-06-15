-- Add archived column to order_messages table
ALTER TABLE public.order_messages 
ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;

-- Create index for better performance on archived messages
CREATE INDEX idx_order_messages_archived ON public.order_messages(archived);