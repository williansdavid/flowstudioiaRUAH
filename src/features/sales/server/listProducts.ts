// src/features/sales/server/listProducts.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  avatarUrl: string | null;
  department: string | null;
  commissionRate: number;
}

export const listProducts = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ProductItem[]> => {
    const supabase = createSupabaseServer();
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, avatar_url, department, commission_rate')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return (data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      avatarUrl: p.avatar_url,
      department: p.department,
      commissionRate: Number(p.commission_rate ?? 0),
    }));
  },
);