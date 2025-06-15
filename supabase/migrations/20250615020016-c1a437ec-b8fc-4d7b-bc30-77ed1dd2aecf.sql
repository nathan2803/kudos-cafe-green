-- Add archived column to orders table
ALTER TABLE public.orders 
ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;

-- Create index for better performance on archived orders
CREATE INDEX idx_orders_archived ON public.orders(archived);