/**
 * Complete TypeScript definitions and schema typing for Supabase database.
 * Matches tables: users, products, todos.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          stock: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          stock?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          stock?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      todos: {
        Row: {
          id: string;
          title: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          completed?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      ping: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type InsertUser = Database['public']['Tables']['users']['Insert'];
export type UpdateUser = Database['public']['Tables']['users']['Update'];

export type Product = Database['public']['Tables']['products']['Row'];
export type InsertProduct = Database['public']['Tables']['products']['Insert'];
export type UpdateProduct = Database['public']['Tables']['products']['Update'];

export type Todo = Database['public']['Tables']['todos']['Row'];
export type InsertTodo = Database['public']['Tables']['todos']['Insert'];
export type UpdateTodo = Database['public']['Tables']['todos']['Update'];
