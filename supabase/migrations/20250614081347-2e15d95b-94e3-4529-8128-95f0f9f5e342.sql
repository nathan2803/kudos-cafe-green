-- Add RLS policies to allow admins to view all orders
-- First, let's check current policies and update them

-- Drop existing policies if they exist and recreate them properly
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can modify all orders" ON public.orders;

-- Create comprehensive RLS policies for orders
-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (
  auth.uid() = user_id
);

-- Users can create their own orders
CREATE POLICY "Users can create their own orders" ON public.orders
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR user_id IS NULL -- Allow guest orders (user_id = NULL)
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

-- Guests can create orders without being logged in
CREATE POLICY "Allow guest orders" ON public.orders
FOR INSERT WITH CHECK (
  user_id IS NULL
);