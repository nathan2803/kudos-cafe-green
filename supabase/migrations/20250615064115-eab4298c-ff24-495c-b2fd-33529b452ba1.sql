-- Clean up and optimize the reviews table structure

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id_approved ON public.reviews(user_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_menu_item_id ON public.reviews(menu_item_id) WHERE menu_item_id IS NOT NULL;

-- Ensure the storage bucket exists for review images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Update storage policies to be more permissive for better functionality
DROP POLICY IF EXISTS "Review images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own review images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own review images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own review images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all review images" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "Review images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'review-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own review images" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'review-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can manage all review images" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'review-images' AND public.is_admin());