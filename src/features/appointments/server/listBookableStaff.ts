// src/features/appointments/server/listBookableStaff.ts
import { getSupabaseForContext } from '@/lib/supabase/context';
import type { BookableStaffItem } from '../types';

interface RawRow {
  id: string;
  display_order: number;
  color: string | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

/**
 * Fase 1 — leitura direta ao Supabase (sa-east-1), sem serverFn.
 * Mesma assinatura (sem args) e retorno do original — callers não mudam.
 */
export async function listBookableStaff(): Promise<BookableStaffItem[]> {
  const supabase = await getSupabaseForContext();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('[appointments] Sessão inválida.');
  }

  const { data, error } = await supabase
    .from('staff')
    .select('id, display_order, color, profiles(full_name, avatar_url)')
    .eq('is_bookable', true)
    .order('display_order', { ascending: true });

  if (error) throw error;

  return (data as unknown as RawRow[]).map((r) => ({
    id: r.id,
    name: r.profiles?.full_name ?? 'Profissional',
    displayOrder: r.display_order,
    avatarUrl: r.profiles?.avatar_url ?? null,
    color: r.color ?? null,
  }));
}