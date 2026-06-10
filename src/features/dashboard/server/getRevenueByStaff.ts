// src/features/dashboard/server/getRevenueByStaff.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { RevenueByStaffItem } from '@/features/dashboard/types';

/** Início do mês corrente em ISO (UTC) — mesmo padrão do getDashboardData. */
function monthStartISO(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

interface RawRow {
  amount: number | string;
  staff_id: string | null;
  staff: { profiles: { full_name: string | null } | null } | null;
}

export const getRevenueByStaff = createServerFn({ method: 'GET' }).handler(
  async (): Promise<RevenueByStaffItem[]> => {
    const supabase = createSupabaseServer();

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
      .select('amount, staff_id, staff(profiles(full_name))')
      .eq('type', 'income')
      .eq('category', 'service')
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
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  },
);
