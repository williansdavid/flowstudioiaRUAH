// src/features/dashboard/server/getRevenueByStaff.ts
import { getSupabaseForContext } from '@/lib/supabase/context';
import type { RevenueByStaffItem } from '@/features/dashboard/types';
function monthStartISO(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}
interface RawRow {
  amount: number | string;
  staff_id: string | null;
  staff: {
    color: string | null;
    profiles: { full_name: string | null } | null;
  } | null;
}
/**
 * Fase 2 — leitura direta ao Supabase (sa-east-1), sem serverFn.
 * Mesma assinatura (sem args) e retorno do original — callers não mudam.
 */
export async function getRevenueByStaff(): Promise<RevenueByStaffItem[]> {
  const supabase = await getSupabaseForContext();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('[revenueByStaff] Sessão inválida.');
  }
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profileError || !profile) {
    throw new Error('[revenueByStaff] Perfil não encontrado.');
  }
  if (profile.role !== 'admin') {
    throw new Error('[revenueByStaff] Acesso negado.');
  }
  const { data, error } = await supabase
    .from('finance_transactions')
    .select('amount, staff_id, staff!inner(color, profiles!inner(full_name))')
    .eq('type', 'income')
    .gte('occurred_at', monthStartISO());
  if (error) throw error;
  const rows = (data ?? []) as unknown as RawRow[];
  const map = new Map<string, RevenueByStaffItem>();
  for (const row of rows) {
    const key = row.staff_id ?? '__none__';
    const name =
      row.staff?.profiles?.full_name ??
      (row.staff_id ? 'Profissional' : 'Sem profissional');
    const existing = map.get(key);
    if (existing) {
      existing.total += Number(row.amount);
    } else {
      map.set(key, {
        staffId: row.staff_id,
        staffName: name,
        total: Number(row.amount),
        color: row.staff?.color ?? '#6366f1',
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}