-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can modify all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow guest orders" ON public.orders;

-- Create comprehensive RLS policies for orders
-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (
  auth.uid() = user_id
);

-- Users can create their own orders
CREATE POLICY "Users can create their own orders" ON public.orders
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR user_id IS NULL -- Allow guest orders
);

-- Users can update their own orders
CREATE POLICY "Users can update their own orders" ON public.orders
FOR UPDATE USING (
  auth.uid() = user_id
);

-- Admins can view ALL orders (including guest orders)
CREATE POLICY "Admins can view all orders" ON public.orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Admins can modify ALL orders
CREATE POLICY "Admins can modify all orders" ON public.orders
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Drop existing policies for reservations to recreate them
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can create their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can modify all reservations" ON public.reservations;

-- Create comprehensive RLS policies for reservations
-- Users can view their own reservations
CREATE POLICY "Users can view their own reservations" ON public.reservations
FOR SELECT USING (
  auth.uid() = user_id
);

-- Users can create their own reservations
CREATE POLICY "Users can create their own reservations" ON public.reservations
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Users can update their own reservations
CREATE POLICY "Users can update their own reservations" ON public.reservations
FOR UPDATE USING (
  auth.uid() = user_id
);

-- Admins can view all reservations
CREATE POLICY "Admins can view all reservations" ON public.reservations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Admins can modify all reservations
CREATE POLICY "Admins can modify all reservations" ON public.reservations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);