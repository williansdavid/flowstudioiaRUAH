// src/features/sales/server/updateSaleDraft.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const inputSchema = z.object({
  saleId: z.string().uuid(),
  clientName: z.string().min(1),
  items: z.array(z.object({
    itemType: z.enum(['product', 'service']),
    itemId: z.string().uuid().nullable(),
    itemName: z.string().min(1),
    quantity: z.number().int().min(1),
    unitPrice: z.number().positive(),
    isLocked: z.boolean().default(false),
  })).min(1),
});

export const updateSaleDraft = createServerFn({ method: 'POST' })
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

    // Recalcula total
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity, 0,
    );

    // Deleta itens antigos e insere novos (substituição atômica)
    const { error: deleteError } = await supabase
      .from('sale_items')
      .delete()
      .eq('sale_id', data.saleId);
    if (deleteError) throw deleteError;

    const itemsToInsert = data.items.map((item) => ({
      sale_id: data.saleId,
      item_type: item.itemType,
      item_id: item.itemId,
      item_name: item.itemName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
      is_locked: item.isLocked,
    }));

    const { error: insertError } = await supabase
      .from('sale_items')
      .insert(itemsToInsert);
    if (insertError) throw insertError;

    // Atualiza total e nome do cliente
    const { error: updateError } = await supabase
      .from('sales')
      .update({
        total_amount: totalAmount,
        client_name: data.clientName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.saleId);
    if (updateError) throw updateError;

    return { id: data.saleId };
  });

export type UpdateSaleDraftInput = z.infer<typeof inputSchema>;