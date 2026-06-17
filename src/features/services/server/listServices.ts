// src/features/services/server/listServices.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { ServiceItem } from '../types';

export const listServices = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ServiceItem[]> => {
    const supabase = createSupabaseServer();

    const { data, error } = await supabase
      .from('services')
      .select(
        'id, name, description, category, duration_minutes, price, display_order, is_active',
      )
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      throw new Error('Não foi possível carregar os serviços.');
    }

    return (data ?? []).map((row): ServiceItem => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      durationMinutes: row.duration_minutes,
      price: Number(row.price),
      displayOrder: row.display_order,
      isActive: row.is_active,
    }));

  },
);
