-- Add new columns to orders table for ASAP pickup features
ALTER TABLE public.orders 
ADD COLUMN asap_charge NUMERIC DEFAULT 0,
ADD COLUMN pickup_time TEXT,
ADD COLUMN is_priority BOOLEAN DEFAULT false;