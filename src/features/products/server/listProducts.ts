// src/features/products/server/listProducts.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { ProductItem } from '../types';

export const listProducts = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ProductItem[]> => {
    const supabase = createSupabaseServer();
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, avatar_url, department, is_active, commission_rate')
      .order('name');

    if (error) throw error;

    return (data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      avatarUrl: p.avatar_url,
      department: p.department,
      isActive: p.is_active,
      commissionRate: Number(p.commission_rate ?? 0),
    }));
  },
);