-- Insert sample orders for the past week using existing user and guest orders
INSERT INTO public.orders (user_id, total_amount, status, payment_status, order_type, customer_name, customer_phone, customer_email, notes, deposit_paid, remaining_amount, created_at, updated_at) VALUES
-- June 7, 2025 (Monday) - Mix of user and guest orders
('88cbf59c-bc40-49ca-848b-edb934fe3203', 45.50, 'delivered', 'paid', 'takeout', 'Nathan Mendoza', '+1234567890', 'nathanmendoza2803@gmail.com', 'Extra spicy please', 0, 0, '2025-06-07 11:30:00', '2025-06-07 12:45:00'),
('88cbf59c-bc40-49ca-848b-edb934fe3203', 78.25, 'delivered', 'paid', 'dine_in', 'Nathan Mendoza', '+1234567890', 'nathanmendoza2803@gmail.com', 'Table for 4, anniversary dinner', 27.39, 50.86, '2025-06-07 18:15:00', '2025-06-07 20:30:00'),
(NULL, 23.75, 'ready', 'paid', 'pickup', 'Jane Smith', '+1555123456', 'jane.smith@example.com', 'Guest order - no account', 0, 0, '2025-06-07 14:20:00', '2025-06-07 14:35:00'),

-- June 8, 2025 (Tuesday)
('88cbf59c-bc40-49ca-848b-edb934fe3203', 62.00, 'delivered', 'paid', 'takeout', 'Nathan Mendoza', '+1234567890', 'nathanmendoza2803@gmail.com', 'No onions', 0, 0, '2025-06-08 12:15:00', '2025-06-08 13:00:00'),
('88cbf59c-bc40-49ca-848b-edb934fe3203', 156.75, 'delivered', 'paid', 'dine_in', 'Nathan Mendoza', '+1234567890', 'nathanmendoza2803@gmail.com', 'Birthday celebration for 8 people', 54.86, 101.89, '2025-06-08 19:00:00', '2025-06-08 21:15:00'),
(NULL, 34.50, 'preparing', 'paid', 'pickup', 'Walk-in Customer', '+1555987654', 'walkin@example.com', 'Ready in 20 minutes', 0, 0, '2025-06-08 16:45:00', '2025-06-08 16:45:00'),

-- June 9, 2025 (Wednesday)
('88cbf59c-bc40-49ca-848b-edb934fe3203', 89.25, 'delivered', 'paid', 'takeout', 'Nathan Mendoza', '+1234567890', 'nathanmendoza2803@gmail.com', 'Office delivery', 0, 0, '2025-06-09 13:30:00', '2025-06-09 14:15:00'),
('88cbf59c-bc40-49ca-848b-edb934fe3203', 125.00, 'delivered', 'paid', 'dine_in', 'Nathan Mendoza', '+1234567890', 'nathanmendoza2803@gmail.com', 'Business lunch for 6', 43.75, 81.25, '2025-06-09 12:00:00', '2025-06-09 14:00:00'),
(NULL, 28.00, 'cancelled', 'refunded', 'pickup', 'Cancelled Order', '+1555444333', 'cancel@example.com', 'Customer cancelled', 0, 0, '2025-06-09 15:30:00', '2025-06-09 15:45:00'),

-- June 10, 2025 (Thursday)
(NULL, 67.50, 'delivered', 'paid', 'takeout', 'Mike Wilson', '+1234567891', 'mike.wilson@example.com', 'Family dinner', 0, 0, '2025-06-10 18:45:00', '2025-06-10 19:30:00'),
('88cbf59c-bc40-49ca-848b-edb934fe3203', 198.75, 'delivered', 'paid', 'dine_in', 'Nathan Mendoza', '+1234567890', 'nathanmendoza2803@gmail.com', 'Corporate event for 12 people', 69.56, 129.19, '2025-06-10 19:30:00', '2025-06-10 22:00:00'),
(NULL, 41.25, 'ready', 'paid', 'pickup', 'Quick Pickup', '+1555222111', 'quick@example.com', '', 0, 0, '2025-06-10 11:15:00', '2025-06-10 11:30:00'),

-- June 11, 2025 (Friday)
(NULL, 112.50, 'delivered', 'paid', 'takeout', 'Sarah Johnson', '+1234567893', 'sarah.johnson@example.com', 'Weekend family order', 0, 0, '2025-06-11 19:15:00', '2025-06-11 20:00:00'),
('88cbf59c-bc40-49ca-848b-edb934fe3203', 245.00, 'delivered', 'paid', 'dine_in', 'Nathan Mendoza', '+1234567890', 'nathanmendoza2803@gmail.com', 'Friday night celebration for 10', 85.75, 159.25, '2025-06-11 20:00:00', '2025-06-11 22:30:00'),
(NULL, 55.75, 'preparing', 'paid', 'pickup', 'Evening Pickup', '+1555111000', 'evening@example.com', 'Will pick up at 8 PM', 0, 0, '2025-06-11 17:30:00', '2025-06-11 17:30:00'),

-- June 12, 2025 (Saturday)
('88cbf59c-bc40-49ca-848b-edb934fe3203', 87.25, 'delivered', 'paid', 'takeout', 'Nathan Mendoza', '+1234567890', 'nathanmendoza2803@gmail.com', 'Saturday night dinner', 0, 0, '2025-06-12 19:45:00', '2025-06-12 20:30:00'),
('88cbf59c-bc40-49ca-848b-edb934fe3203', 167.50, 'delivered', 'paid', 'dine_in', 'Nathan Mendoza', '+1234567890', 'nathanmendoza2803@gmail.com', 'Weekend brunch for 8', 58.63, 108.87, '2025-06-12 11:30:00', '2025-06-12 13:45:00'),
(NULL, 73.00, 'ready', 'paid', 'pickup', 'Weekend Order', '+1555999888', 'weekend@example.com', 'Large family order', 0, 0, '2025-06-12 16:20:00', '2025-06-12 16:35:00'),

-- June 13, 2025 (Sunday)
(NULL, 95.75, 'delivered', 'paid', 'takeout', 'David Brown', '+1234567892', 'david.brown@example.com', 'Sunday family meal', 0, 0, '2025-06-13 17:00:00', '2025-06-13 17:45:00'),
('88cbf59c-bc40-49ca-848b-edb934fe3203', 189.25, 'delivered', 'paid', 'dine_in', 'Nathan Mendoza', '+1234567890', 'nathanmendoza2803@gmail.com', 'Sunday special dinner for 10', 66.24, 123.01, '2025-06-13 18:30:00', '2025-06-13 21:00:00'),
(NULL, 49.50, 'confirmed', 'paid', 'pickup', 'Sunday Pickup', '+1555777666', 'sunday@example.com', 'Pickup scheduled for 7 PM', 0, 0, '2025-06-13 18:00:00', '2025-06-13 18:15:00'),

-- June 14, 2025 (Today)
(NULL, 76.25, 'preparing', 'paid', 'takeout', 'Alex Garcia', '+1234567894', 'alex.garcia@example.com', 'Monday dinner', 0, 0, '2025-06-14 18:30:00', '2025-06-14 18:30:00'),
('88cbf59c-bc40-49ca-848b-edb934fe3203', 134.50, 'confirmed', 'partial', 'dine_in', 'Nathan Mendoza', '+1234567890', 'nathanmendoza2803@gmail.com', 'Evening reservation for 6', 47.08, 87.42, '2025-06-14 19:00:00', '2025-06-14 19:15:00');