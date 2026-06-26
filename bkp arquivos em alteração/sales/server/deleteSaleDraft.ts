// src/features/sales/server/deleteSaleDraft.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const inputSchema = z.object({
  saleId: z.string().uuid(),
});

export const deleteSaleDraft = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = createSupabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Sessão inválida.');

    // Verifica se o rascunho existe e pertence ao usuário
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select('id, status')
      .eq('id', data.saleId)
      .eq('created_by', user.id)
      .single();
    if (saleError || !sale) throw new Error('Rascunho não encontrado.');
    if (sale.status !== 'draft') throw new Error('Venda já finalizada.');

    // Deleta sale_items (ON DELETE CASCADE cuida)
    const { error: deleteItemsError } = await supabase
      .from('sale_items')
      .delete()
      .eq('sale_id', data.saleId);
    if (deleteItemsError) throw deleteItemsError;

    // Deleta sale_payments
    const { error: deletePaymentsError } = await supabase
      .from('sale_payments')
      .delete()
      .eq('sale_id', data.saleId);
    if (deletePaymentsError) throw deletePaymentsError;

    // Deleta a sale
    const { error: deleteSaleError } = await supabase
      .from('sales')
      .delete()
      .eq('id', data.saleId);
    if (deleteSaleError) throw deleteSaleError;

    return { deleted: true };
  });