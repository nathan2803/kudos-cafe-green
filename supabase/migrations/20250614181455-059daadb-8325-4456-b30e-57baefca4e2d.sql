-- Update all existing profiles to be verified
UPDATE public.profiles SET is_verified = true WHERE is_verified = false;