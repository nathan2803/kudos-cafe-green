-- Create gallery_images table for storing restaurant photos
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'interior', 'customers', 'events')),
  uploaded_by UUID REFERENCES auth.users(id),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies for gallery images
CREATE POLICY "Gallery images are viewable by everyone" 
ON public.gallery_images 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert gallery images" 
ON public.gallery_images 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can update gallery images" 
ON public.gallery_images 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can delete gallery images" 
ON public.gallery_images 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gallery_images_updated_at
BEFORE UPDATE ON public.gallery_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_gallery_images_category ON public.gallery_images(category);
CREATE INDEX idx_gallery_images_featured ON public.gallery_images(is_featured);
CREATE INDEX idx_gallery_images_created_at ON public.gallery_images(created_at DESC);

-- Insert sample gallery images with proper aspect ratios
INSERT INTO public.gallery_images (title, description, image_url, category, is_featured) VALUES
('Signature Green Salad', 'Fresh organic greens with our house-made vinaigrette', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=600', 'food', true),
('Artisanal Pasta', 'Handmade pasta with seasonal vegetables', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300', 'food', false),
('Restaurant Interior', 'Our warm and inviting dining space', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=500', 'interior', false),
('Farm Fresh Ingredients', 'Locally sourced organic produce', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=700', 'food', true),
('Kitchen in Action', 'Our chefs preparing fresh meals', 'https://images.unsplash.com/photo-1571197200840-ca4a3e07e1f8?w=400&h=350', 'interior', false),
('Happy Customers', 'Guests enjoying their sustainable dining experience', 'https://images.unsplash.com/photo-1529417305485-480f579e3fdd?w=400&h=600', 'customers', true),
('Eco-Friendly Setup', 'Special sustainability event setup', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400', 'events', false),
('Gourmet Dessert', 'House-made dessert with organic ingredients', 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&h=550', 'food', false),
('Green Dining Area', 'Our signature green-themed dining space', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=320', 'interior', false),
('Chef Special', 'Today''s special creation by our head chef', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=650', 'food', true),
('Cozy Corner', 'Perfect spot for intimate dining', 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400&h=250', 'interior', false),
('Organic Harvest', 'Fresh seasonal vegetables from local farms', 'https://images.unsplash.com/photo-1528712306091-ed0763094c98?w=400&h=580', 'food', false),
('Buffalo Wings Platter', 'Our famous crispy buffalo wings', 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&h=450', 'food', true),
('Truffle Carbonara', 'Creamy carbonara with truffle oil - our newest addition', 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=380', 'food', true),
('Katsudon Bowl', 'Traditional Japanese pork cutlet rice bowl', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=520', 'food', false),
('Lechon Kawali', 'Crispy fried pork belly - customer favorite', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=420', 'food', true),
('Nutella Waffle', 'Golden waffle loaded with Nutella spread', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=480', 'food', false),
('Matcha Caramel Overload', 'Our signature matcha latte with caramel drizzle', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=600', 'food', true),
('Evening Ambiance', 'Cozy dinner atmosphere at Kudos Café', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=350', 'interior', false),
('Customer Celebration', 'Birthday celebration at our restaurant', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=500', 'customers', false);