-- Add delivery address and delivery charge columns to orders table
ALTER TABLE public.orders 
ADD COLUMN delivery_address TEXT,
ADD COLUMN delivery_charge NUMERIC DEFAULT 0;