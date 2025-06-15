-- Create storage bucket for gallery hero images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-hero-images', 'gallery-hero-images', true);

-- Create policies for gallery hero images
CREATE POLICY "Gallery hero images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'gallery-hero-images');

CREATE POLICY "Admins can upload gallery hero images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'gallery-hero-images' AND public.is_admin());

CREATE POLICY "Admins can update gallery hero images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'gallery-hero-images' AND public.is_admin());

CREATE POLICY "Admins can delete gallery hero images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'gallery-hero-images' AND public.is_admin());