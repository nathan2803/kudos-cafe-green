-- Fix the order number generation function to avoid ambiguous column reference
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  today_date TEXT;
  next_number INTEGER;
  order_number_result TEXT;
BEGIN
  -- Get today's date in YYYYMMDD format
  today_date := to_char(CURRENT_DATE, 'YYYYMMDD');
  
  -- Get the next sequential number for today
  SELECT COALESCE(MAX(CAST(SUBSTRING(o.order_number FROM 'ORD-' || today_date || '-(\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.orders o
  WHERE o.order_number LIKE 'ORD-' || today_date || '-%';
  
  -- Format the order number as ORD-YYYYMMDD-XXX (3-digit padding)
  order_number_result := 'ORD-' || today_date || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN order_number_result;
END;
$$;