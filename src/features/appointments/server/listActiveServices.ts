// src/features/appointments/server/listActiveServices.ts
import { getSupabaseForContext } from '@/lib/supabase/context';
import type { ServiceOption } from '../types';

interface RawRow {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

/**
 * Fase 1 — leitura direta ao Supabase (sa-east-1), sem serverFn.
 * Mesma assinatura (sem args) e retorno do original — callers não mudam.
 */
export async function listActiveServices(): Promise<ServiceOption[]> {
  const supabase = await getSupabaseForContext();

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
}