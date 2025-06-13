import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmwepxidwdlscbrttneb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtd2VweGlkd2Rsc2NicnR0bmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDgyODMsImV4cCI6MjA2NTQyNDI4M30.sUoyKkYO3t8dclGqZ1kCLl-yo25MLJvVdxNy-upJTPo'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  is_admin: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  dietary_restrictions?: string[]
  favorite_dishes?: string[]
  notification_settings: {
    email: boolean
    sms: boolean
    promotional: boolean
  }
}

export interface UserAddress {
  id: string
  user_id: string
  address_line1: string
  address_line2?: string
  city: string
  postal_code: string
  is_default: boolean
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  is_available: boolean
  dietary_tags?: string[]
  is_popular: boolean
  is_new: boolean
}

export interface Order {
  id: string
  user_id: string
  items: OrderItem[]
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  delivery_address?: string
  order_type: 'dine-in' | 'takeaway' | 'delivery'
  created_at: string
  updated_at: string
}

export interface OrderItem {
  menu_item_id: string
  quantity: number
  price: number
  special_instructions?: string
}

export interface Review {
  id: string
  user_id: string
  menu_item_id?: string
  rating: number
  comment: string
  created_at: string
  user?: {
    full_name: string
  }
}

export interface LoyaltyPoints {
  id: string
  user_id: string
  points_balance: number
  tier_level: 'bronze' | 'silver' | 'gold'
  total_earned: number
}