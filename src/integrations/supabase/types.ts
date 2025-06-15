export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      about_us_sections: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          order_index: number
          section_key: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          order_index?: number
          section_key: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          order_index?: number
          section_key?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_featured: boolean
          likes_count: number
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_featured?: boolean
          likes_count?: number
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_featured?: boolean
          likes_count?: number
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          average_cost: number | null
          barcode: string | null
          category_id: string | null
          created_at: string
          current_price: number | null
          current_stock: number | null
          description: string | null
          id: string
          is_active: boolean | null
          is_perishable: boolean | null
          max_stock_level: number | null
          min_stock_level: number | null
          name: string
          shelf_life_days: number | null
          sku: string | null
          storage_location: string | null
          unit_of_measurement: string | null
          updated_at: string
        }
        Insert: {
          average_cost?: number | null
          barcode?: string | null
          category_id?: string | null
          created_at?: string
          current_price?: number | null
          current_stock?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_perishable?: boolean | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          name: string
          shelf_life_days?: number | null
          sku?: string | null
          storage_location?: string | null
          unit_of_measurement?: string | null
          updated_at?: string
        }
        Update: {
          average_cost?: number | null
          barcode?: string | null
          category_id?: string | null
          created_at?: string
          current_price?: number | null
          current_stock?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_perishable?: boolean | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          name?: string
          shelf_life_days?: number | null
          sku?: string | null
          storage_location?: string | null
          unit_of_measurement?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          content: string
          created_at: string
          document_type: string
          id: string
          last_updated: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          document_type: string
          id?: string
          last_updated?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          document_type?: string
          id?: string
          last_updated?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      low_stock_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string | null
          created_at: string
          id: string
          is_acknowledged: boolean | null
          item_id: string | null
          threshold_value: number | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string | null
          created_at?: string
          id?: string
          is_acknowledged?: boolean | null
          item_id?: string | null
          threshold_value?: number | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string | null
          created_at?: string
          id?: string
          is_acknowledged?: boolean | null
          item_id?: string | null
          threshold_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "low_stock_alerts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_tags: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_menu_item_tags_menu_item"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_menu_item_tags_tag"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "menu_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          dietary_tags: string[] | null
          id: string
          image_url: string | null
          is_available: boolean
          is_new: boolean
          is_popular: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          dietary_tags?: string[] | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_new?: boolean
          is_popular?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          dietary_tags?: string[] | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_new?: boolean
          is_popular?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      menu_tags: {
        Row: {
          category: string
          color: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category?: string
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          order_id: string
          quantity: number
          special_instructions: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          order_id: string
          quantity?: number
          special_instructions?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          order_id?: string
          quantity?: number
          special_instructions?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_messages: {
        Row: {
          archived: boolean
          cancellation_reason: string | null
          created_at: string
          id: string
          is_read: boolean
          is_urgent: boolean
          message: string
          message_type: string
          order_id: string | null
          parent_message_id: string | null
          recipient_id: string | null
          sender_id: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          archived?: boolean
          cancellation_reason?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          is_urgent?: boolean
          message: string
          message_type: string
          order_id?: string | null
          parent_message_id?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          archived?: boolean
          cancellation_reason?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          is_urgent?: boolean
          message?: string
          message_type?: string
          order_id?: string | null
          parent_message_id?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "order_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          archived: boolean
          asap_charge: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_address: string | null
          delivery_charge: number | null
          deposit_paid: number | null
          id: string
          is_priority: boolean | null
          notes: string | null
          order_number: string | null
          order_type: string | null
          payment_status: string
          pickup_time: string | null
          refund_amount: number | null
          remaining_amount: number | null
          reservation_id: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived?: boolean
          asap_charge?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_charge?: number | null
          deposit_paid?: number | null
          id?: string
          is_priority?: boolean | null
          notes?: string | null
          order_number?: string | null
          order_type?: string | null
          payment_status?: string
          pickup_time?: string | null
          refund_amount?: number | null
          remaining_amount?: number | null
          reservation_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived?: boolean
          asap_charge?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_charge?: number | null
          deposit_paid?: number | null
          id?: string
          is_priority?: boolean | null
          notes?: string | null
          order_number?: string | null
          order_type?: string | null
          payment_status?: string
          pickup_time?: string | null
          refund_amount?: number | null
          remaining_amount?: number | null
          reservation_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          created_at: string
          effective_date: string
          id: string
          item_id: string | null
          price: number
          supplier_id: string | null
        }
        Insert: {
          created_at?: string
          effective_date: string
          id?: string
          item_id?: string | null
          price: number
          supplier_id?: string | null
        }
        Update: {
          created_at?: string
          effective_date?: string
          id?: string
          item_id?: string | null
          price?: number
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_admin: boolean
          is_verified: boolean
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_admin?: boolean
          is_verified?: boolean
          phone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_admin?: boolean
          is_verified?: boolean
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string
          deposit_amount: number | null
          id: string
          order_id: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          special_requests: string | null
          status: string
          table_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          deposit_amount?: number | null
          id?: string
          order_id?: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          special_requests?: string | null
          status?: string
          table_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          deposit_amount?: number | null
          id?: string
          order_id?: string | null
          party_size?: number
          reservation_date?: string
          reservation_time?: string
          special_requests?: string | null
          status?: string
          table_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          admin_response: string | null
          comment: string
          created_at: string
          id: string
          images: Json | null
          is_approved: boolean
          is_featured: boolean
          menu_item_id: string | null
          order_id: string | null
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          comment: string
          created_at?: string
          id?: string
          images?: Json | null
          is_approved?: boolean
          is_featured?: boolean
          menu_item_id?: string | null
          order_id?: string | null
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          comment?: string
          created_at?: string
          id?: string
          images?: Json | null
          is_approved?: boolean
          is_featured?: boolean
          menu_item_id?: string | null
          order_id?: string | null
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          batch_number: string | null
          created_at: string
          created_by: string | null
          expiration_date: string | null
          id: string
          item_id: string | null
          movement_type: string | null
          quantity: number
          reason: string | null
          reference_number: string | null
          supplier_id: string | null
          total_cost: number | null
          unit_price: number | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          expiration_date?: string | null
          id?: string
          item_id?: string | null
          movement_type?: string | null
          quantity: number
          reason?: string | null
          reference_number?: string | null
          supplier_id?: string | null
          total_cost?: number | null
          unit_price?: number | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          expiration_date?: string | null
          id?: string
          item_id?: string | null
          movement_type?: string | null
          quantity?: number
          reason?: string | null
          reference_number?: string | null
          supplier_id?: string | null
          total_cost?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tables: {
        Row: {
          capacity: number
          created_at: string
          id: string
          is_available: boolean
          location: string | null
          table_number: number
          updated_at: string
        }
        Insert: {
          capacity: number
          created_at?: string
          id?: string
          is_available?: boolean
          location?: string | null
          table_number: number
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          is_available?: boolean
          location?: string | null
          table_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string
          dietary_restrictions: string[] | null
          id: string
          notification_email: boolean
          notification_promotional: boolean
          notification_sms: boolean
          postal_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          id?: string
          notification_email?: boolean
          notification_promotional?: boolean
          notification_sms?: boolean
          postal_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          id?: string
          notification_email?: boolean
          notification_promotional?: boolean
          notification_sms?: boolean
          postal_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_table_availability: {
        Args: {
          p_table_id: string
          p_date: string
          p_time: string
          p_duration_hours?: number
        }
        Returns: boolean
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
