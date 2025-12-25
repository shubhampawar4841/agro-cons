import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types based on your schema
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  weight: string;
  image_url: string;
  stock_quantity: number;
  is_active: boolean;
  ingredients: string[] | null;
  health_benefits: string[] | null;
  how_to_use: string[] | null;
  nutrition_facts: any;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'created' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  amount: number;
  shipping_address: any;
  payment_method: 'upi' | 'card' | 'cod' | null;
  payment_status: 'pending' | 'paid' | 'failed';
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  created_at: string;
}

