-- Create menu_tags table for storing available tags
CREATE TABLE public.menu_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'custom',
  color TEXT NOT NULL DEFAULT '#3B82F6',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menu_item_tags junction table for many-to-many relationships
CREATE TABLE public.menu_item_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(menu_item_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE public.menu_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for menu_tags (readable by all, writable by admins)
CREATE POLICY "Menu tags are viewable by everyone" 
ON public.menu_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can insert menu tags" 
ON public.menu_tags 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update menu tags" 
ON public.menu_tags 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can delete menu tags" 
ON public.menu_tags 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create policies for menu_item_tags (readable by all, writable by admins)
CREATE POLICY "Menu item tags are viewable by everyone" 
ON public.menu_item_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can insert menu item tags" 
ON public.menu_item_tags 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update menu item tags" 
ON public.menu_item_tags 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can delete menu item tags" 
ON public.menu_item_tags 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Add foreign key constraints
ALTER TABLE public.menu_item_tags 
ADD CONSTRAINT fk_menu_item_tags_menu_item 
FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;

ALTER TABLE public.menu_item_tags 
ADD CONSTRAINT fk_menu_item_tags_tag 
FOREIGN KEY (tag_id) REFERENCES public.menu_tags(id) ON DELETE CASCADE;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_menu_tags_updated_at
BEFORE UPDATE ON public.menu_tags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default tags
INSERT INTO public.menu_tags (name, category, color, description) VALUES
('Vegetarian', 'dietary', '#22C55E', 'Suitable for vegetarians'),
('Vegan', 'dietary', '#16A34A', 'Plant-based, no animal products'),
('Gluten-Free', 'dietary', '#F59E0B', 'Does not contain gluten'),
('Dairy-Free', 'dietary', '#06B6D4', 'No dairy products'),
('Nut-Free', 'allergen', '#EF4444', 'Safe for nut allergies'),
('Spicy', 'flavor', '#DC2626', 'Contains spicy ingredients'),
('Halal', 'dietary', '#10B981', 'Prepared according to Islamic law'),
('Kosher', 'dietary', '#3B82F6', 'Prepared according to Jewish law'),
('Limited Time', 'promotional', '#8B5CF6', 'Available for limited time only'),
('Chef Special', 'promotional', '#F97316', 'Recommended by the chef');