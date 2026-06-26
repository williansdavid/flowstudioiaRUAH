// src/features/sales/server/createSaleDraft.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const inputSchema = z.object({
  appointmentId: z.string().uuid().optional(),
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

export const createSaleDraft = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = createSupabaseServer();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Sessão inválida.');

    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity, 0,
    );

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        sale_type: data.appointmentId ? 'appointment' : 'product',
        appointment_id: data.appointmentId ?? null,
        client_name: data.clientName,
        total_amount: totalAmount,
        status: 'draft',
        created_by: user.id,
      })
      .select('id')
      .single();

    if (saleError || !sale) throw saleError;

    const itemsToInsert = data.items.map((item) => ({
      sale_id: sale.id,
      item_type: item.itemType,
      item_id: item.itemId,
      item_name: item.itemName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
      is_locked: item.isLocked,
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return { id: sale.id };    
  });
  export type CreateSaleDraftInput = z.infer<typeof inputSchema>;