-- First, let's temporarily disable the foreign key constraint to add sample data
-- We'll add sample profiles for demonstration purposes
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Insert sample Filipino users for demonstration
INSERT INTO public.profiles (user_id, full_name, email, phone, is_admin, is_verified) VALUES
(gen_random_uuid(), 'Maria Santos', 'maria.santos@email.com', '+639171234567', false, true),
(gen_random_uuid(), 'Juan dela Cruz', 'juan.delacruz@email.com', '+639281234568', false, true),
(gen_random_uuid(), 'Ana Reyes', 'ana.reyes@email.com', '+639391234569', false, true),
(gen_random_uuid(), 'Jose Garcia', 'jose.garcia@email.com', '+639451234570', false, true),
(gen_random_uuid(), 'Carmen Lopez', 'carmen.lopez@email.com', '+639561234571', false, true),
(gen_random_uuid(), 'Roberto Martinez', 'roberto.martinez@email.com', '+639671234572', false, true),
(gen_random_uuid(), 'Luz Hernandez', 'luz.hernandez@email.com', '+639781234573', false, true),
(gen_random_uuid(), 'Pedro Gonzalez', 'pedro.gonzalez@email.com', '+639891234574', false, true),
(gen_random_uuid(), 'Rosa Perez', 'rosa.perez@email.com', '+639901234575', false, true),
(gen_random_uuid(), 'Miguel Torres', 'miguel.torres@email.com', '+639121234576', false, true),
(gen_random_uuid(), 'Linda Castro', 'linda.castro@email.com', '+639231234577', false, true),
(gen_random_uuid(), 'Carlos Ramos', 'carlos.ramos@email.com', '+639341234578', false, true),
(gen_random_uuid(), 'Elena Flores', 'elena.flores@email.com', '+639451234579', false, true),
(gen_random_uuid(), 'Francisco Silva', 'francisco.silva@email.com', '+639561234580', false, true),
(gen_random_uuid(), 'Gloria Morales', 'gloria.morales@email.com', '+639671234581', false, true);

-- Re-add the foreign key constraint but make it optional for existing data
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE 
NOT VALID;