-- Add gallery hero background image setting to site_settings
INSERT INTO public.site_settings (setting_key, setting_value) 
VALUES ('gallery_hero_background', '{"background_image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop", "title": "Gallery", "subtitle": "Explore our beautiful moments"}')
ON CONFLICT (setting_key) DO NOTHING;