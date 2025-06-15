-- Insert default contact information
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('contact_info', '{
  "title": "Experience Green Dining Today",
  "subtitle": "Come and discover the perfect blend of sustainable practices and exceptional flavors. We are open and ready to serve you the finest eco-friendly dining experience.",
  "address_line1": "123 Green Street, Eco District",
  "address_line2": "London, EC1 2AB",
  "phone": "+44 (0) 20 7123 4567",
  "phone_description": "Call us for reservations",
  "opening_hours": {
    "monday_thursday": "7AM - 10PM",
    "friday_saturday": "7AM - 11PM",
    "sunday": "8AM - 9PM"
  },
  "restaurant_image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
  "rating": "4.9"
}')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value;