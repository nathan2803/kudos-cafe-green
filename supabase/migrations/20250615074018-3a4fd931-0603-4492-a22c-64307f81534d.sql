-- Create table for about us content sections
CREATE TABLE public.about_us_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.about_us_sections ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "About us sections are viewable by everyone" 
ON public.about_us_sections 
FOR SELECT 
USING (is_active = true);

-- Create policies for authenticated users to manage (we'll refine this later)
CREATE POLICY "Authenticated users can manage about us sections" 
ON public.about_us_sections 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Insert default content
INSERT INTO public.about_us_sections (section_key, title, content, image_url, order_index) VALUES
('hero', 'Where Sustainability Meets Flavor', 'At Kudos Cafe & Restaurant, we believe that great food and environmental responsibility go hand in hand. Our commitment to sustainability extends from our locally sourced, organic ingredients to our zero-waste kitchen practices.', 'https://images.unsplash.com/photo-1571197200840-ca4a3e07e1f8?w=600&h=400&fit=crop', 1),
('story', 'Our Story', 'Founded in 2020 with a vision to create a dining experience that nourishes both people and planet, Kudos Cafe has grown from a small neighborhood eatery to a beloved destination for conscious diners. Every dish tells a story of sustainable sourcing, innovative cooking, and community connection.', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop', 2),
('mission', 'Our Mission', 'We are dedicated to serving exceptional food while minimizing our environmental impact. From farm to table, every decision we make considers the health of our customers, our community, and our planet. We partner with local farmers, use renewable energy, and maintain a zero-waste kitchen.', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop', 3),
('team', 'Meet Our Team', 'Our passionate team of chefs, servers, and sustainability experts work together to create an unforgettable dining experience. Led by Chef Maria Rodriguez, our kitchen team brings over 20 years of combined experience in sustainable cuisine and innovative cooking techniques.', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=400&fit=crop', 4);