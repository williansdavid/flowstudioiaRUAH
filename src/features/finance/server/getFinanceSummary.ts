// src/features/finance/server/getFinanceSummary.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { getPeriodRange, getPreviousPeriodRange } from '../utils/periodRange';
import type { FinanceSummary } from '../types';

const inputSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom']),
  customRange: z.object({ start: z.string(), end: z.string() }).optional(),
});

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function sumAmount(rows: { amount: number | string }[]): number {
  return rows.reduce((acc: number, row: { amount: number | string }) => acc + Number(row.amount), 0);
}

export const getFinanceSummary = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<FinanceSummary> => {
    const supabase = createSupabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[finance] Sessão inválida.');
    }

    const range = getPeriodRange(data.period, data.customRange);
    const prevRange = getPreviousPeriodRange(range);

    async function sumByType(start: string, end: string, type: 'income' | 'expense') {
      const { data: rows, error } = await supabase
        .from('finance_transactions')
        .select('amount')
        .eq('type', type)
        .gte('occurred_at', `${start}T00:00:00`)
        .lte('occurred_at', `${end}T23:59:59`);
      if (error) throw error;
      return sumAmount(rows ?? []);
    }

    async function countCompletedAppointments(start: string, end: string) {
      const { count, error } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('starts_at', `${start}T00:00:00`)
        .lte('starts_at', `${end}T23:59:59`);
      if (error) throw error;
      return count ?? 0;
    }

    async function sumCommissionInRange(start: string, end: string) {
      const { data: rows, error } = await supabase
        .from('finance_transactions')
        .select('commission_value')
        .eq('type', 'income')
        .not('staff_id', 'is', null)
        .gte('occurred_at', `${start}T00:00:00`)
        .lte('occurred_at', `${end}T23:59:59`);
      if (error) throw error;
      return (rows ?? []).reduce((acc, row) => acc + Number(row.commission_value ?? 0), 0);
    }

    const [
      revenue,
      prevRevenue,
      expenses,
      prevExpenses,
      appointmentsCount,
      prevAppointmentsCount,
      totalCommission,
      prevTotalCommission,
    ] = await Promise.all([
      sumByType(range.start, range.end, 'income'),
      sumByType(prevRange.start, prevRange.end, 'income'),
      sumByType(range.start, range.end, 'expense'),
      sumByType(prevRange.start, prevRange.end, 'expense'),
      countCompletedAppointments(range.start, range.end),
      countCompletedAppointments(prevRange.start, prevRange.end),
      sumCommissionInRange(range.start, range.end),
      sumCommissionInRange(prevRange.start, prevRange.end),
    ]);

    const avgTicket = appointmentsCount > 0 ? revenue / appointmentsCount : 0;
    const prevAvgTicket = prevAppointmentsCount > 0 ? prevRevenue / prevAppointmentsCount : 0;
    const netBalance = revenue - expenses;
    const prevNetBalance = prevRevenue - prevExpenses;

    return {
      revenue: { value: revenue, deltaPct: pctDelta(revenue, prevRevenue) },
      avgTicket: { value: avgTicket, deltaPct: pctDelta(avgTicket, prevAvgTicket) },
      appointmentsCount: {
        value: appointmentsCount,
        deltaPct: pctDelta(appointmentsCount, prevAppointmentsCount),
      },
      expenses: { value: expenses, deltaPct: pctDelta(expenses, prevExpenses) },
      netBalance: { value: netBalance, deltaPct: pctDelta(netBalance, prevNetBalance) },
      totalCommission: {
        value: totalCommission,
        deltaPct: pctDelta(totalCommission, prevTotalCommission),
      },
    };
  });