-- Drop existing admin policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new admin policy using the security definer function
CREATE POLICY "Admins can manage all reviews" 
ON public.reviews 
FOR ALL 
USING (public.is_admin());