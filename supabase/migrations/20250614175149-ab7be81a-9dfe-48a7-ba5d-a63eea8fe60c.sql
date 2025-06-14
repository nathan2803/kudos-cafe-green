-- First update existing null values
UPDATE public.profiles 
SET phone = '' 
WHERE phone IS NULL;

-- Now make phone mandatory
ALTER TABLE public.profiles 
ALTER COLUMN phone SET NOT NULL;