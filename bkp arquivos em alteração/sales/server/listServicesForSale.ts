// src/features/sales/server/listServicesForSale.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';

export interface ServiceForSaleItem {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export const listServicesForSale = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ServiceForSaleItem[]> => {
    const supabase = createSupabaseServer();
    const { data, error } = await supabase
      .from('services')
      .select('id, name, duration_minutes, price')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      price: Number(s.price),
      durationMinutes: s.duration_minutes,
    }));
  },
);