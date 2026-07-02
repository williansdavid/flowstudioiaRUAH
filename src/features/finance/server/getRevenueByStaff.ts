// src/features/finance/server/getRevenueByStaff.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { getPeriodRange } from '../utils/periodRange';
import type { StaffRevenueItem } from '../types';

const inputSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom']),
  customRange: z.object({ start: z.string(), end: z.string() }).optional(),
});

// staff.full_name e staff.commission_rate existem direto na tabela staff
// (não precisam passar por profiles). commission_rate vem como numeric ("70.00" = 70%).
interface RawRow {
  amount: number | string;
  staff_id: string | null;
  staff: {
    full_name: string | null;
    color: string | null;
    commission_rate: number | string | null;
  } | null;
}

export const getRevenueByStaffFinance = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<StaffRevenueItem[]> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[finance] Sessão inválida.');
    }

    const range = getPeriodRange(data.period, data.customRange);

    const { data: rows, error } = await supabase
      .from('finance_transactions')
      .select('amount, staff_id, staff(full_name, color, commission_rate)')
      .eq('type', 'income')
      .not('staff_id', 'is', null)
      .gte('occurred_at', `${range.start}T00:00:00`)
      .lte('occurred_at', `${range.end}T23:59:59`);

    if (error) throw error;

    const grouped = new Map<
      string,
      { name: string; color: string | null; commissionRate: number; revenue: number; count: number }
    >();

    for (const row of (rows ?? []) as unknown as RawRow[]) {
      const id = row.staff_id;
      if (!id) continue;

      const current = grouped.get(id) ?? {
        name: row.staff?.full_name ?? 'Profissional',
        color: row.staff?.color ?? null,
        commissionRate: Number(row.staff?.commission_rate ?? 0),
        revenue: 0,
        count: 0,
      };
      current.revenue += Number(row.amount);
      current.count += 1;
      grouped.set(id, current);
    }

    return Array.from(grouped.entries())
      .map(([staffId, v]) => ({
        staffId,
        staffName: v.name,
        staffAvatarUrl: null,
        staffColor: v.color,
        commissionRate: v.commissionRate,
        revenue: v.revenue,
        commission: v.revenue * (v.commissionRate / 100),
        appointmentsCount: v.count,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  });
