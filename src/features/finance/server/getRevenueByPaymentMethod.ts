// src/features/finance/server/getRevenueByPaymentMethod.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { getPeriodRange } from '../utils/periodRange';
import type { PaymentMethodSlice } from '../types';

const inputSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom']),
  customRange: z.object({ start: z.string(), end: z.string() }).optional(),
});

export const getRevenueByPaymentMethod = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<PaymentMethodSlice[]> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[finance] Sessão inválida.');
    }

    const range = getPeriodRange(data.period, data.customRange);

    // --- ORIGEM CORRIGIDA: sale_payments ao invés de finance_transactions ---
    const [{ data: rows, error }, { data: methods, error: methodsError }] = await Promise.all([
      supabase
        .from('sale_payments')
        .select('amount, payment_method_id')
        .gte('created_at', `${range.start}T00:00:00`)
        .lte('created_at', `${range.end}T23:59:59`),
      supabase.from('payment_methods').select('id, name'),
    ]);

    if (error) throw error;
    if (methodsError) throw methodsError;

    const methodNameById = new Map((methods ?? []).map((m) => [m.id, m.name]));

    const grouped = new Map<string, { name: string; amount: number }>();

    for (const row of rows ?? []) {
      const id = row.payment_method_id ?? 'sem-forma';
      const name = row.payment_method_id
        ? methodNameById.get(row.payment_method_id) ?? 'Não informado'
        : 'Não informado';

      const current = grouped.get(id) ?? { name, amount: 0 };
      current.amount += Number(row.amount);
      grouped.set(id, current);
    }

    const total = Array.from(grouped.values()).reduce((acc, g) => acc + g.amount, 0);

    return Array.from(grouped.entries())
      .map(([id, g]) => ({
        paymentMethodId: id,
        paymentMethodName: g.name,
        paymentMethodIcon: null,
        amount: g.amount,
        percentage: total > 0 ? (g.amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  });