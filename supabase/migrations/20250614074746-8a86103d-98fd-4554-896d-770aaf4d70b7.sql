-- Create tables table for restaurant seating
CREATE TABLE public.tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number INTEGER NOT NULL UNIQUE,
  capacity INTEGER NOT NULL,
  location TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  table_id UUID REFERENCES public.tables(id),
  order_id UUID REFERENCES public.orders(id),
  party_size INTEGER NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests TEXT,
  deposit_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add order_type and reservation fields to orders table
ALTER TABLE public.orders 
ADD COLUMN order_type TEXT DEFAULT 'takeout' CHECK (order_type IN ('pickup', 'takeout', 'dine_in')),
ADD COLUMN reservation_id UUID REFERENCES public.reservations(id),
ADD COLUMN deposit_paid NUMERIC DEFAULT 0,
ADD COLUMN remaining_amount NUMERIC DEFAULT 0;

-- Enable RLS
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tables
CREATE POLICY "Tables are viewable by everyone" ON public.tables
FOR SELECT USING (true);

CREATE POLICY "Only admins can modify tables" ON public.tables
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- RLS Policies for reservations
CREATE POLICY "Users can view their own reservations" ON public.reservations
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own reservations" ON public.reservations
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reservations" ON public.reservations
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all reservations" ON public.reservations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can modify all reservations" ON public.reservations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_tables_updated_at
BEFORE UPDATE ON public.tables
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample tables
INSERT INTO public.tables (table_number, capacity, location) VALUES
(1, 2, 'Window side'),
(2, 4, 'Center area'),
(3, 6, 'Private corner'),
(4, 2, 'Bar area'),
(5, 4, 'Garden view'),
(6, 8, 'Large dining'),
(7, 2, 'Intimate booth'),
(8, 4, 'Main dining');

-- Create function to check table availability
CREATE OR REPLACE FUNCTION check_table_availability(
  p_table_id UUID,
  p_date DATE,
  p_time TIME,
  p_duration_hours INTEGER DEFAULT 2
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.reservations r
    WHERE r.table_id = p_table_id
    AND r.reservation_date = p_date
    AND r.status IN ('confirmed', 'pending')
    AND (
      (r.reservation_time <= p_time AND (r.reservation_time + INTERVAL '1 hour' * p_duration_hours) > p_time)
      OR (p_time <= r.reservation_time AND (p_time + INTERVAL '1 hour' * p_duration_hours) > r.reservation_time)
    )
  );
END;
$$ LANGUAGE plpgsql;