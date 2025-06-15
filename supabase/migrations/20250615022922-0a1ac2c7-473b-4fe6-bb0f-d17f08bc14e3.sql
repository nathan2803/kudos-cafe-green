-- Fix existing orders that have reservations but missing reservation_id
UPDATE public.orders 
SET reservation_id = reservations.id
FROM public.reservations 
WHERE orders.id = reservations.order_id 
AND orders.reservation_id IS NULL;