-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  dietary_tags TEXT[],
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies for menu_items (public read, admin write)
CREATE POLICY "Everyone can view menu items" 
ON public.menu_items 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage menu items" 
ON public.menu_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert menu items from your list
INSERT INTO public.menu_items (name, description, price, category, is_popular, is_new) VALUES
-- Appetizers
('Mojos', 'Crispy potato wedges with signature seasoning', 125.00, 'Appetizers', false, false),
('Twister Fries', 'Spiral-cut fries with spicy coating', 145.00, 'Appetizers', false, false),
('Bistro Fries', 'Thick-cut fries with garlic parmesan', 125.00, 'Appetizers', false, false),
('Buffalo Wings', 'Crispy fried chicken wings with buffalo sauce', 220.00, 'Appetizers', true, false),
('Hickory Wings', 'Smoky BBQ glazed chicken wings', 220.00, 'Appetizers', false, false),
('Mozzarella Sticks', 'Fried mozzarella sticks with marinara dip', 165.00, 'Appetizers', false, false),
('Nachos', 'Classic nachos with cheese dip', 135.00, 'Appetizers', false, false),
('Nachos Overload', 'Loaded nachos with ground beef and guacamole', 165.00, 'Appetizers', true, false),

-- Pasta
('Tuna Pesto', 'Tuna flakes in basil pesto sauce with pasta', 165.00, 'Pasta', false, false),
('Seafood Marinara', 'Mixed seafood in tomato marinara sauce', 175.00, 'Pasta', false, false),
('Truffle Carbonara', 'Creamy carbonara with truffle oil', 189.00, 'Pasta', false, true),
('Aglio Olio', 'Garlic olive oil pasta with chili flakes', 165.00, 'Pasta', false, false),

-- Main Course
('Katsudon', 'Japanese pork cutlet rice bowl', 185.00, 'Main Course', false, false),
('Lechon Kawali', 'Crispy fried pork belly', 195.00, 'Main Course', true, false),
('Garlic Pepper Beef', 'Stir-fried beef with garlic and black pepper', 185.00, 'Main Course', false, false),
('Inalamangan Pork Rebusado', 'Crispy fried pork with calamansi dip', 175.00, 'Main Course', false, false),
('Kudos Original', 'House special grilled chicken platter', 185.00, 'Main Course', false, false),
('Crispy Chicken Kare-kare', 'Crispy chicken with peanut kare-kare sauce', 195.00, 'Main Course', false, true),

-- Desserts
('Smores', 'Classic campfire treat with chocolate and marshmallow', 155.00, 'Desserts', false, false),
('Golden Waffle', 'Golden brown waffle with maple syrup', 125.00, 'Desserts', false, false),
('Nutella Waffle', 'Waffle loaded with Nutella spread', 125.00, 'Desserts', true, false),
('Matcha Waffle', 'Green tea flavored waffle with red bean', 125.00, 'Desserts', false, false),

-- Drinks
('Choco-Mint', 'Chocolate mint milkshake', 165.00, 'Drinks', false, false),
('Matcha Caramel Overload', 'Matcha latte with caramel drizzle', 155.00, 'Drinks', true, false),
('Biscoff Caramel Latte', 'Biscoff cookie flavored latte', 145.00, 'Drinks', false, false),
('Dirty-Matcha Caramel', 'Espresso layered over matcha latte', 135.00, 'Drinks', false, false);