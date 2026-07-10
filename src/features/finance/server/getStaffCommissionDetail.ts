// src/features/finance/server/getStaffCommissionDetail.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { getPeriodRange } from '../utils/periodRange';
import type { CommissionTransaction, FinancePeriod, PeriodRange } from '../types';

const inputSchema = z.object({
  staffId: z.string().uuid(),
  period: z.enum(['today', 'week', 'month', 'custom']),
  customRange: z
    .object({ start: z.string(), end: z.string() })
    .optional(),
});

interface RawTransaction {
  id: string;
  category: string;
  amount: number | string;
  commission_value: number | string | null;
  description: string | null;
  occurred_at: string;
  settled_at: string | null;
}

export const getStaffCommissionDetail = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<CommissionTransaction[]> => {
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
      .select('id, category, amount, commission_value, description, occurred_at, settled_at')
      .eq('type', 'income')
      .eq('staff_id', data.staffId)
      .gte('occurred_at', `${range.start}T00:00:00`)
      .lte('occurred_at', `${range.end}T23:59:59`)
      .order('occurred_at', { ascending: false });

    if (error) throw error;

    return ((rows ?? []) as unknown as RawTransaction[]).map((row) => ({
      id: row.id,
      category: row.category as CommissionTransaction['category'],
      amount: Number(row.amount),
      commissionValue: Number(row.commission_value ?? 0),
      description: row.description,
      occurredAt: row.occurred_at,
      isSettled: row.settled_at !== null,
      settledAt: row.settled_at,
    }));
  });