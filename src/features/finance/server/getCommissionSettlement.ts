// src/features/finance/server/getCommissionSettlement.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { getPeriodRange } from '../utils/periodRange';
import type { StaffCommissionSummary } from '../types';

const inputSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom']),
  customRange: z.object({ start: z.string(), end: z.string() }).optional(),
});

export const getCommissionSettlement = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<StaffCommissionSummary[]> => {
    const supabase = createSupabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[finance] Sessão inválida.');
    }

    // ─── Descobre role e staff_id do usuário logado ───
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    let staffIdFilter: string | null = null;

    if (profile?.role === 'staff') {
      // Se é staff, descobre qual staff.id está vinculado ao profile
      const { data: staffRec } = await supabase
        .from('staff')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();
      staffIdFilter = staffRec?.id ?? null;
    }

    // ─── Query ───
    const range = getPeriodRange(data.period, data.customRange);

    let query = supabase
      .from('finance_transactions')
      .select(`
        staff_id,
        staff(full_name, color),
        amount,
        commission_value,
        settled_at
      `)
      .eq('type', 'income')
      .not('staff_id', 'is', null)
      .gte('occurred_at', `${range.start}T00:00:00`)
      .lte('occurred_at', `${range.end}T23:59:59`);

    // ─── Se for staff, filtra apenas as transações dele ───
    if (staffIdFilter) {
      query = query.eq('staff_id', staffIdFilter);
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    const grouped = new Map<
      string,
      {
        name: string;
        color: string | null;
        totalRevenue: number;
        totalCommission: number;
        settledCommission: number;
        count: number;
      }
    >();

    for (const row of rows ?? []) {
      const staffId = row.staff_id as string;
      if (!staffId) continue;

      const staff = row.staff as unknown as {
        full_name: string | null;
        color: string | null;
      } | null;

      const amount = Number(row.amount ?? 0);
      const commissionValue = Number(row.commission_value ?? 0);
      const isSettled = row.settled_at !== null;

      const current = grouped.get(staffId) ?? {
        name: staff?.full_name ?? 'Profissional',
        color: staff?.color ?? null,
        totalRevenue: 0,
        totalCommission: 0,
        settledCommission: 0,
        count: 0,
      };

      current.totalRevenue += amount;
      current.totalCommission += commissionValue;
      if (isSettled) {
        current.settledCommission += commissionValue;
      }
      current.count += 1;
      grouped.set(staffId, current);
    }

    return Array.from(grouped.entries())
      .map(([staffId, v]) => ({
        staffId,
        staffName: v.name,
        staffColor: v.color,
        staffAvatarUrl: null,
        totalRevenue: v.totalRevenue,
        totalCommission: v.totalCommission,
        settledCommission: v.settledCommission,
        pendingCommission: v.totalCommission - v.settledCommission,
        appointmentCount: v.count,
      }))
      .sort((a, b) => b.pendingCommission - a.pendingCommission);
  });