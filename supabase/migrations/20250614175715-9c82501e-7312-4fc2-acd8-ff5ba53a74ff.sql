-- Create foreign key relationship between orders and profiles
ALTER TABLE public.orders 
ADD CONSTRAINT fk_orders_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create foreign key relationship between reservations and profiles  
-- (Note: reservations.user_id should reference auth.users, not profiles)
ALTER TABLE public.reservations 
ADD CONSTRAINT fk_reservations_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;