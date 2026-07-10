// src/features/report/server/getCashFlowDailyReport.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { getPeriodRange } from '../utils/periodRange';
import type { CashFlowDailyRow } from '../types';

const inputSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom']),
  customRange: z.object({ start: z.string(), end: z.string() }).optional(),
});

export const getCashFlowDailyReport = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<CashFlowDailyRow[]> => {
    const supabase = createSupabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[report] Sessão inválida.');
    }

    const range = getPeriodRange(data.period, data.customRange);

    const { data: rows, error } = await supabase.rpc('get_cash_flow_report_daily', {
      p_start_date: range.start,
      p_end_date: range.end,
    });

    if (error) throw error;

    return (rows ?? []).map((row: CashFlowDailyRow) => ({
      date: row.date,
      income: Number(row.income),
      expense: Number(row.expense),
      netBalance: Number(row.netBalance ?? row.income - row.expense),
    }));
  });