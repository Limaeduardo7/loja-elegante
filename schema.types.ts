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
      addresses: {
        Row: {
          address_type: string | null
          city: string
          complement: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          neighborhood: string
          number: string
          postal_code: string
          recipient_name: string | null
          state: string
          street: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address_type?: string | null
          city: string
          complement?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          neighborhood: string
          number: string
          postal_code: string
          recipient_name?: string | null
          state: string
          street: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address_type?: string | null
          city?: string
          complement?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          neighborhood?: string
          number?: string
          postal_code?: string
          recipient_name?: string | null
          state?: string
          street?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_dashboard_widgets: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          required_permission: string | null
          settings: Json | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          required_permission?: string | null
          settings?: Json | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          required_permission?: string | null
          settings?: Json | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_dashboard_widgets_required_permission_fkey"
            columns: ["required_permission"]
            isOneToOne: false
            referencedRelation: "admin_permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_menus: {
        Row: {
          component: string | null
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          parent_id: string | null
          required_permission: string | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          component?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          parent_id?: string | null
          required_permission?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          component?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          parent_id?: string | null
          required_permission?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_menus_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "admin_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_menus_required_permission_fkey"
            columns: ["required_permission"]
            isOneToOne: false
            referencedRelation: "admin_permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_permissions: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          resource?: string
        }
        Relationships: []
      }
      admin_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          format: string | null
          id: string
          is_scheduled: boolean | null
          name: string
          parameters: Json | null
          query: string
          schedule_settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          format?: string | null
          id?: string
          is_scheduled?: boolean | null
          name: string
          parameters?: Json | null
          query: string
          schedule_settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          format?: string | null
          id?: string
          is_scheduled?: boolean | null
          name?: string
          parameters?: Json | null
          query?: string
          schedule_settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          color_size_id: string | null
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          cart_id: string
          color_size_id?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          cart_id?: string
          color_size_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_color_size_id_fkey"
            columns: ["color_size_id"]
            isOneToOne: false
            referencedRelation: "color_size_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          id: string
          session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      color_size_variants: {
        Row: {
          color_id: string
          created_at: string | null
          id: string
          product_id: string
          size_id: string
          sku: string | null
          stock_quantity: number
          updated_at: string | null
        }
        Insert: {
          color_id: string
          created_at?: string | null
          id?: string
          product_id: string
          size_id: string
          sku?: string | null
          stock_quantity?: number
          updated_at?: string | null
        }
        Update: {
          color_id?: string
          created_at?: string | null
          id?: string
          product_id?: string
          size_id?: string
          sku?: string | null
          stock_quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "color_size_variants_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "product_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "color_size_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "color_size_variants_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "product_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          min_purchase: number | null
          updated_at: string | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string
          valid_to: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          min_purchase?: number | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from: string
          valid_to: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          min_purchase?: number | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string
          valid_to?: string
        }
        Relationships: []
      }
      home_banners: {
        Row: {
          button_link: string | null
          button_text: string | null
          created_at: string | null
          display_order: number | null
          end_date: string | null
          id: string
          image_url: string
          is_active: boolean | null
          start_date: string | null
          subtitle: string | null
          title: string
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          start_date?: string | null
          subtitle?: string | null
          title: string
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          start_date?: string | null
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      mercadopago_notifications: {
        Row: {
          created_at: string | null
          id: string
          processed: boolean | null
          raw_data: Json
          resource_id: string
          resource_type: string
          topic: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          processed?: boolean | null
          raw_data: Json
          resource_id: string
          resource_type: string
          topic: string
        }
        Update: {
          created_at?: string | null
          id?: string
          processed?: boolean | null
          raw_data?: Json
          resource_id?: string
          resource_type?: string
          topic?: string
        }
        Relationships: []
      }
      mercadopago_transactions: {
        Row: {
          created_at: string | null
          external_reference: string | null
          id: string
          installments: number | null
          merchant_order_id: string | null
          order_id: string
          payment_data: Json | null
          payment_id: string | null
          payment_method_id: string | null
          payment_type: string | null
          preference_id: string | null
          processing_mode: string | null
          status: string
          status_detail: string | null
          transaction_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          external_reference?: string | null
          id?: string
          installments?: number | null
          merchant_order_id?: string | null
          order_id: string
          payment_data?: Json | null
          payment_id?: string | null
          payment_method_id?: string | null
          payment_type?: string | null
          preference_id?: string | null
          processing_mode?: string | null
          status: string
          status_detail?: string | null
          transaction_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          external_reference?: string | null
          id?: string
          installments?: number | null
          merchant_order_id?: string | null
          order_id?: string
          payment_data?: Json | null
          payment_id?: string | null
          payment_method_id?: string | null
          payment_type?: string | null
          preference_id?: string | null
          processing_mode?: string | null
          status?: string
          status_detail?: string | null
          transaction_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mercadopago_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color_name: string | null
          color_size_id: string | null
          created_at: string | null
          id: string
          order_id: string
          product_data: Json | null
          product_id: string
          product_name: string
          quantity: number
          size: string | null
          total_price: number | null
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          color_name?: string | null
          color_size_id?: string | null
          created_at?: string | null
          id?: string
          order_id: string
          product_data?: Json | null
          product_id: string
          product_name: string
          quantity: number
          size?: string | null
          total_price?: number | null
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          color_name?: string | null
          color_size_id?: string | null
          created_at?: string | null
          id?: string
          order_id?: string
          product_data?: Json | null
          product_id?: string
          product_name?: string
          quantity?: number
          size?: string | null
          total_price?: number | null
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_color_size_id_fkey"
            columns: ["color_size_id"]
            isOneToOne: false
            referencedRelation: "color_size_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address_id: string | null
          created_at: string | null
          customer_cpf: string | null
          customer_data: Json | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_amount: number
          id: string
          notes: string | null
          order_number: string
          payment_date: string | null
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          shipping_address: string | null
          shipping_address_id: string | null
          shipping_amount: number
          shipping_complement: string | null
          shipping_cost: number | null
          shipping_data: Json | null
          status: string
          total_amount: number
          tracking_code: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_address_id?: string | null
          created_at?: string | null
          customer_cpf?: string | null
          customer_data?: Json | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          order_number: string
          payment_date?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: string | null
          shipping_address_id?: string | null
          shipping_amount?: number
          shipping_complement?: string | null
          shipping_cost?: number | null
          shipping_data?: Json | null
          status?: string
          total_amount: number
          tracking_code?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_address_id?: string | null
          created_at?: string | null
          customer_cpf?: string | null
          customer_data?: Json | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_date?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: string | null
          shipping_address_id?: string | null
          shipping_amount?: number
          shipping_complement?: string | null
          shipping_cost?: number | null
          shipping_data?: Json | null
          status?: string
          total_amount?: number
          tracking_code?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_billing_address_id_fkey"
            columns: ["billing_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pagarme_transactions: {
        Row: {
          created_at: string | null
          external_reference: string | null
          id: string
          order_id: string | null
          payment_data: Json | null
          status: string
          transaction_amount: number
          transaction_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          external_reference?: string | null
          id?: string
          order_id?: string | null
          payment_data?: Json | null
          status: string
          transaction_amount: number
          transaction_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          external_reference?: string | null
          id?: string
          order_id?: string | null
          payment_data?: Json | null
          status?: string
          transaction_amount?: number
          transaction_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagarme_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          access_token: string | null
          client_id: string | null
          client_secret: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_production: boolean | null
          provider: string
          public_key: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_production?: boolean | null
          provider: string
          public_key?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_production?: boolean | null
          provider?: string
          public_key?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_colors: {
        Row: {
          color_code: string
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          product_id: string
        }
        Insert: {
          color_code: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          product_id: string
        }
        Update: {
          color_code?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_main: boolean | null
          product_id: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_main?: boolean | null
          product_id: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_main?: boolean | null
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sizes: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          product_id: string
          size: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          product_id: string
          size: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          product_id?: string
          size?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          created_at: string | null
          product_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          product_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          discount_percent: number | null
          features: string | null
          id: string
          in_stock: boolean | null
          is_active: boolean | null
          is_featured: boolean | null
          material: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          name: string
          price: number
          sku: string | null
          slug: string
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          features?: string | null
          id?: string
          in_stock?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          material?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          name: string
          price: number
          sku?: string | null
          slug: string
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          features?: string | null
          id?: string
          in_stock?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          material?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          name?: string
          price?: number
          sku?: string | null
          slug?: string
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_products: {
        Row: {
          created_at: string | null
          product_id: string
          promotion_id: string
        }
        Insert: {
          created_at?: string | null
          product_id: string
          promotion_id: string
        }
        Update: {
          created_at?: string | null
          product_id?: string
          promotion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_products_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean | null
          comment: string | null
          created_at: string | null
          id: string
          product_id: string
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved?: boolean | null
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "admin_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string | null
          data_type: string
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          data_type: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          data_type?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_metadata: {
        Row: {
          created_at: string | null
          id: number
          is_admin: boolean | null
          is_banned: boolean | null
          last_sign_in: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_admin?: boolean | null
          is_banned?: boolean | null
          last_sign_in?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          is_admin?: boolean | null
          is_banned?: boolean | null
          last_sign_in?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_metadata_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          birth_date: string | null
          created_at: string | null
          email: string
          email_confirmed: boolean | null
          first_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          password: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          email: string
          email_confirmed?: boolean | null
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          password?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          email?: string
          email_confirmed?: boolean | null
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          password?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_admin_users: {
        Row: {
          email: string | null
          id: string | null
          is_admin: boolean | null
          is_admin_role: boolean | null
          name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      confirm_user_email: {
        Args: { user_id: string }
        Returns: undefined
      }
      get_admin_role_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_role_id_string: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_users_with_role: {
        Args: { role_name: string }
        Returns: {
          user_id: string
          email: string
          name: string
        }[]
      }
      has_role: {
        Args: { user_id: string; role_name: string }
        Returns: boolean
      }
      list_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          name: string
          is_admin: boolean
        }[]
      }
      listar_administradores: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      promover_para_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      remover_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      verificar_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      order_status:
        | "aguardando_pagamento"
        | "pagamento_aprovado"
        | "em_preparacao"
        | "enviado"
        | "entregue"
        | "cancelado"
      payment_method:
        | "cartao_credito"
        | "boleto"
        | "pix"
        | "paypal"
        | "mercadopago"
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
    Enums: {
      order_status: [
        "aguardando_pagamento",
        "pagamento_aprovado",
        "em_preparacao",
        "enviado",
        "entregue",
        "cancelado",
      ],
      payment_method: [
        "cartao_credito",
        "boleto",
        "pix",
        "paypal",
        "mercadopago",
      ],
    },
  },
} as const
