import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  is_featured: boolean;
  is_top_selling: boolean;
  stock_quantity: number;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  author: string;
  published_at: string;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string | null;
  author_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export interface SmoothieMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  ingredients: string[];
  image_url: string;
  available: boolean;
  category: string;
  created_at: string;
}
