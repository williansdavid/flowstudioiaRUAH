// src/features/finance/server/getRevenueTrend.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { getPeriodRange } from '../utils/periodRange';
import type { RevenueTrendPoint } from '../types';

const inputSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom']),
  customRange: z.object({ start: z.string(), end: z.string() }).optional(),
});

interface RawRow {
  amount: number | string;
  type: 'income' | 'expense';
  occurred_at: string;
}

export const getRevenueTrend = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<RevenueTrendPoint[]> => {
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
      .select('amount, type, occurred_at')
      .gte('occurred_at', `${range.start}T00:00:00`)
      .lte('occurred_at', `${range.end}T23:59:59`)
      .order('occurred_at', { ascending: true });

    if (error) throw error;

    const byDate = new Map<string, { income: number; expense: number }>();

    const cursor = new Date(`${range.start}T00:00:00`);
    const end = new Date(`${range.end}T00:00:00`);
    while (cursor <= end) {
      byDate.set(cursor.toISOString().slice(0, 10), { income: 0, expense: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    for (const row of (rows ?? []) as unknown as RawRow[]) {
      const dateKey = String(row.occurred_at).slice(0, 10);
      const bucket = byDate.get(dateKey) ?? { income: 0, expense: 0 };
      if (row.type === 'income') bucket.income += Number(row.amount);
      else bucket.expense += Number(row.amount);
      byDate.set(dateKey, bucket);
    }

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, income: v.income, expense: v.expense }));
  });
