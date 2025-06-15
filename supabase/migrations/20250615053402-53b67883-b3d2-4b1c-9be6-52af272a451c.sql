-- Add images column to reviews table
ALTER TABLE public.reviews 
ADD COLUMN images JSONB DEFAULT '[]'::jsonb;

-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public) VALUES ('review-images', 'review-images', true);

-- Create storage policies for review images
CREATE POLICY "Review images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'review-images');

CREATE POLICY "Users can upload their own review images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'review-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own review images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'review-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own review images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'review-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can manage all review images" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'review-images' AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND is_admin = true
));

-- Add index for better performance on images column
CREATE INDEX idx_reviews_images ON public.reviews USING GIN(images);

-- Add index for featured reviews on landing page
CREATE INDEX idx_reviews_featured_approved ON public.reviews(is_featured, is_approved, created_at DESC) 
WHERE is_featured = true AND is_approved = true;