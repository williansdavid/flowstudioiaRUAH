// src/features/finance/server/settleCommission.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const settleSchema = z.object({
  transactionIds: z.array(z.string().uuid()).min(1, 'Selecione ao menos uma transação'),
});

export const settleCommission = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => settleSchema.parse(data))
  .handler(async ({ data }): Promise<{ settled: number }> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[finance] Sessão inválida.');
    }

    // Chama a função RPC que:
    // 1. Atualiza settled_at / settled_by nas transactions
    // 2. Insere 1 despesa (expense + commission) por staff
    const { error } = await supabase.rpc('settle_commissions', {
      p_transaction_ids: data.transactionIds,
    });

    if (error) throw error;

    return { settled: data.transactionIds.length };
  });