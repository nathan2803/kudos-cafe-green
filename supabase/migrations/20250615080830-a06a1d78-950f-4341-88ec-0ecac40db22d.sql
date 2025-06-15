-- Create table for site settings (hero section)
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Site settings are viewable by everyone" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Create policies for authenticated users to manage
CREATE POLICY "Authenticated users can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default hero content
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('hero_content', '{
  "title_line1": "Fresh Flavors",
  "title_line2": "Green Living",
  "subtitle": "Experience sustainable dining at its finest. Locally sourced ingredients, eco-friendly practices, and unforgettable flavors await you.",
  "background_images": [
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=1920&h=1080&fit=crop"
  ]
}');