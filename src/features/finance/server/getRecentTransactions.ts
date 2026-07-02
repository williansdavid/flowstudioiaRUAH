// src/features/finance/server/getRecentTransactions.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { getPeriodRange } from '../utils/periodRange';
import type { TransactionItem } from '../types';

const inputSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom']),
  customRange: z.object({ start: z.string(), end: z.string() }).optional(),
  limit: z.number().min(1).max(100).optional(),
});

interface RawRow {
  id: string;
  type: 'income' | 'expense';
  category:
    | 'service'
    | 'product'
    | 'commission'
    | 'rent'
    | 'utilities'
    | 'supplies'
    | 'marketing'
    | 'salary'
    | 'other';
  amount: number | string;
  occurred_at: string;
  reference_id: string | null;
  payment_method_id: string | null;
  staff: { full_name: string | null } | null;
}

export const getRecentTransactions = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<TransactionItem[]> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[finance] Sessão inválida.');
    }

    const range = getPeriodRange(data.period, data.customRange);
    const limit = data.limit ?? 20;

    // NOTA: não há FK registrada entre finance_transactions.payment_method_id e
    // payment_methods no schema cache do PostgREST — buscamos payment_methods
    // à parte e cruzamos manualmente em JS. O embed de staff->profiles funciona
    // normalmente (FK existe, mesmo padrão do dashboard).
    const [{ data: rows, error }, { data: methods, error: methodsError }] = await Promise.all([
      supabase
        .from('finance_transactions')
        .select(
          'id, type, category, amount, occurred_at, reference_id, payment_method_id, staff(full_name)',
        )
        .gte('occurred_at', `${range.start}T00:00:00`)
        .lte('occurred_at', `${range.end}T23:59:59`)
        .order('occurred_at', { ascending: false })
        .limit(limit),
      supabase.from('payment_methods').select('id, name'),
    ]);

    if (error) throw error;
    if (methodsError) throw methodsError;

    const methodNameById = new Map((methods ?? []).map((m) => [m.id, m.name]));

    return ((rows ?? []) as unknown as RawRow[]).map((row) => ({
      id: row.id,
      type: row.type,
      category: row.category,
      amount: Number(row.amount),
      occurredAt: row.occurred_at,
      paymentMethodName: row.payment_method_id ? methodNameById.get(row.payment_method_id) ?? null : null,
      staffName: row.staff?.full_name ?? null,
      referenceId: row.reference_id,
    }));
  });
