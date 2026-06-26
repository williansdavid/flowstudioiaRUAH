// src/features/sales/server/createSale.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const paymentSchema = z.object({
  paymentMethodId: z.string().uuid(),
  amount: z.number().positive(),
});

const itemSchema = z.object({
  itemType: z.enum(['product', 'service']),
  itemId: z.string().uuid().nullable(),
  itemName: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().positive(),
  isLocked: z.boolean().default(false),
});

const inputSchema = z.object({
  saleData: z.object({
    saleType: z.enum(['appointment', 'product']),
    appointmentId: z.string().uuid().nullable(),
    clientName: z.string().min(1),
  }),
  items: z.array(itemSchema).min(1),
  payments: z.array(paymentSchema).min(1),
});

export type CreateSaleInput = z.infer<typeof inputSchema>;

export const createSale = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = createSupabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Sessão inválida.');

    // Busca o staff_id correspondente ao auth.uid()
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (staffError || !staff) throw new Error('Staff não encontrado para este usuário.');

    const { data: result, error } = await supabase.rpc('finalize_sale_v2', {
      p_sale_data: {
        sale_type: data.saleData.saleType,
        appointment_id: data.saleData.appointmentId,
        client_name: data.saleData.clientName,
      },
      p_items: data.items as any,
      p_payments: data.payments as any,
      p_user_id: user.id,
      p_staff_id: staff.id,  // ← NOVO: passa o staff_id real
    });

    if (error) {
      throw new Error(error.message);
    }

    return result as { id: string };
  });