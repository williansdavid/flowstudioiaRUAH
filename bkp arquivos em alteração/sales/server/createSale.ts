// src/features/sales/server/createSale.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const paymentSchema = z.object({
  paymentMethodId: z.string().uuid(),
  amount: z.number().positive(),
});

const inputSchema = z.object({
  saleId: z.string().uuid(),
  payments: z.array(paymentSchema).min(1),
});

export const createSale = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = createSupabaseServer();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Sessão inválida.');

    // Chama a função SQL que executa tudo dentro de BEGIN/COMMIT/ROLLBACK
    const { data: result, error } = await supabase.rpc('finalize_sale', {
      p_sale_id: data.saleId,
      p_payments: data.payments as any,
      p_user_id: user.id,
    });

    if (error) {
      // Se a função lançou EXCEPTION, o ROLLBACK já foi feito automaticamente
      throw new Error(error.message);
    }

    return result as { id: string };
  });