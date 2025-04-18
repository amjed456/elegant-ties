export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number
          created_at: string
          name: string
          description: string
          price: string
          image_url: string
          collection_id: number | null
          is_featured: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          description: string
          price: string
          image_url: string
          collection_id?: number | null
          is_featured?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          description?: string
          price?: string
          image_url?: string
          collection_id?: number | null
          is_featured?: boolean
        }
      }
      collections: {
        Row: {
          id: number
          created_at: string
          name: string
          description: string
          image_url: string
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          description: string
          image_url: string
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          description?: string
          image_url?: string
        }
      }
      site_content: {
        Row: {
          id: number
          created_at: string
          key: string
          content: Json
        }
        Insert: {
          id?: number
          created_at?: string
          key: string
          content: Json
        }
        Update: {
          id?: number
          created_at?: string
          key?: string
          content?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 