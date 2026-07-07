// src/features/finance/server/createExpense.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const CATEGORY_VALUES = [
  'rent',
  'utilities',
  'supplies',
  'marketing',
  'salary',
  'commission',
  'other',
] as const;

const createExpenseSchema = z.object({
  category: z.enum(CATEGORY_VALUES),
  amount: z.number().positive('Valor deve ser maior que zero'),
  /** YYYY-MM-DD */
  occurredAt: z.string().min(1, 'Data é obrigatória'),
  description: z.string().max(500).nullable().optional(),
  paymentMethodId: z.string().uuid().nullable().optional(),
  staffId: z.string().uuid().nullable().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const createExpense = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => createExpenseSchema.parse(data))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[finance] Sessão inválida.');
    }

    // Grava meio-dia (T12:00:00) em vez de meia-noite para evitar que o
    // fuso horário empurre a data pro dia anterior/seguinte na conversão UTC.
    const { data: inserted, error } = await supabase
      .from('finance_transactions')
      .insert({
        type: 'expense',
        category: data.category,
        amount: data.amount,
        occurred_at: `${data.occurredAt}T12:00:00`,
        description: data.description ?? null,
        payment_method_id: data.paymentMethodId ?? null,
        staff_id: data.staffId ?? null,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (error) throw error;
    if (!inserted) {
      throw new Error('[finance] Falha ao registrar despesa.');
    }

    return { id: inserted.id };
  });
