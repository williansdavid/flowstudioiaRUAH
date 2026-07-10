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

interface RawRow {
  amount: number | string;
  commission_value: number | string | null;
  category: string;
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
      .select('amount, commission_value, category, staff_id, staff(full_name, color, commission_rate)')
      .eq('type', 'income')
      .not('staff_id', 'is', null)
      .gte('occurred_at', `${range.start}T00:00:00`)
      .lte('occurred_at', `${range.end}T23:59:59`);
    if (error) throw error;

    const grouped = new Map<
      string,
      {
        name: string;
        color: string | null;
        commissionRate: number;
        revenue: number;
        revenueProducts: number;
        revenueServices: number;
        commission: number;
        commissionProducts: number;
        commissionServices: number;
        count: number;
      }
    >();

    for (const row of (rows ?? []) as unknown as RawRow[]) {
      const id = row.staff_id;
      if (!id) continue;
      const current = grouped.get(id) ?? {
        name: row.staff?.full_name ?? 'Profissional',
        color: row.staff?.color ?? null,
        commissionRate: Number(row.staff?.commission_rate ?? 0),
        revenue: 0,
        revenueProducts: 0,
        revenueServices: 0,
        commission: 0,
        commissionProducts: 0,
        commissionServices: 0,
        count: 0,
      };
      const amount = Number(row.amount);
      const commissionValue = Number(row.commission_value ?? 0);

      current.revenue += amount;
      current.commission += commissionValue;

      if (row.category === 'product') {
        current.revenueProducts += amount;
        current.commissionProducts += commissionValue;
      } else {
        current.revenueServices += amount;
        current.commissionServices += commissionValue;
      }

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
        commission: v.commission,
        commissionProducts: v.commissionProducts,
        commissionServices: v.commissionServices,
        revenueProducts: v.revenueProducts,
        revenueServices: v.revenueServices,
        appointmentsCount: v.count,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  });