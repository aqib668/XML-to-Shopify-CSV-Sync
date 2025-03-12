export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          sku: string
          title: string
          description: string | null
          price: number
          image_url: string | null
          vendor: string | null
          product_type: string | null
          data: Json | null
          exported: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku: string
          title: string
          description?: string | null
          price: number
          image_url?: string | null
          vendor?: string | null
          product_type?: string | null
          data?: Json | null
          exported?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string
          title?: string
          description?: string | null
          price?: number
          image_url?: string | null
          vendor?: string | null
          product_type?: string | null
          data?: Json | null
          exported?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      logs: {
        Row: {
          id: string
          event: string
          details: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          event: string
          details?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          event?: string
          details?: string | null
          status?: string
          created_at?: string
        }
      }
      sync_status: {
        Row: {
          id: string
          status: string
          new_products_count: number
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          status: string
          new_products_count?: number
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          status?: string
          new_products_count?: number
          message?: string | null
          created_at?: string
        }
      }
      sync_schedule: {
        Row: {
          id: string
          enabled: boolean
          time: string
          days: string[]
          next_run: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          enabled: boolean
          time: string
          days: string[]
          next_run?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          enabled?: boolean
          time?: string
          days?: string[]
          next_run?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

