// src/features/appointments/server/listActiveServices.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { ServiceOption } from '../types';

interface RawRow {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

export const listActiveServices = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ServiceOption[]> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[appointments] Sessão inválida.');
    }

    const { data, error } = await supabase
      .from('services')
      .select('id, name, duration_minutes, price')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;

    return (data as unknown as RawRow[]).map((r) => ({
      id: r.id,
      name: r.name,
      durationMinutes: r.duration_minutes,
      price: Number(r.price),
    }));
  },
);
