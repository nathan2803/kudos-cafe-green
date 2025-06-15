-- Insert default menu hero settings
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('menu_hero', '{
  "title": "Our Green Menu",
  "subtitle": "Discover our carefully crafted dishes made with locally sourced, organic ingredients. Each meal is prepared with love for both your taste buds and the environment.",
  "button_text": "Explore Menu",
  "background_image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop",
  "overlay_opacity": 0.6,
  "overlay_color": "#000000"
}')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value;