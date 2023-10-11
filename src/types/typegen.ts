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
      categories: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string
          icon: string
          id?: string
          name: string
          user_id?: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'categories_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      events: {
        Row: {
          category_id: string | null
          created_at: string
          datetime: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          datetime: string
          id?: string
          title: string
          user_id?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          datetime?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'events_category_id_fkey'
            columns: ['category_id']
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'events_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      periods: {
        Row: {
          color: string | null
          created_at: string
          end_datetime: string
          icon: string | null
          id: string
          start_datetime: string
          title: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          end_datetime: string
          icon?: string | null
          id?: string
          start_datetime: string
          title: string
          user_id?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          end_datetime?: string
          icon?: string | null
          id?: string
          start_datetime?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'periods_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
