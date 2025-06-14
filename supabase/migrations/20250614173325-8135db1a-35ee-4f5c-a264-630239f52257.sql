-- First, clear the existing orders and order_items tables
DELETE FROM public.order_items;
DELETE FROM public.orders;

-- Add order_number column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- Create function to generate sequential order numbers per day
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  today_date TEXT;
  next_number INTEGER;
  order_number TEXT;
BEGIN
  -- Get today's date in YYYYMMDD format
  today_date := to_char(CURRENT_DATE, 'YYYYMMDD');
  
  -- Get the next sequential number for today
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'ORD-' || today_date || '-(\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.orders
  WHERE order_number LIKE 'ORD-' || today_date || '-%';
  
  -- Format the order number as ORD-YYYYMMDD-XXX (3-digit padding)
  order_number := 'ORD-' || today_date || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN order_number;
END;
$$;

-- Create trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_order_number ON public.orders;
CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_number();