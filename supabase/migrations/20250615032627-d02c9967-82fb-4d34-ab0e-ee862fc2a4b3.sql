-- Update orders table order_type constraint to allow 'delivery' instead of 'takeout'
ALTER TABLE public.orders 
DROP CONSTRAINT orders_order_type_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_order_type_check 
CHECK (order_type IN ('pickup', 'delivery', 'dine_in'));