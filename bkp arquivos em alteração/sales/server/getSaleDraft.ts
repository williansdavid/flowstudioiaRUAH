// src/features/sales/server/getSaleDraft.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';

export interface SaleDraftResult {
  id: string;
  saleType: 'product' | 'appointment';
  appointmentId: string | null;
  clientName: string;
  totalAmount: number;
  items: Array<{
    id: string;
    itemType: 'product' | 'service';
    itemId: string | null;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    isLocked: boolean;
  }>;
  payments: Array<{
    id: string;
    paymentMethodId: string;
    amount: number;
  }>;
}

export const getSaleDraft = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SaleDraftResult | null> => {
    const supabase = createSupabaseServer();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    // Busca rascunho pendente mais recente do operador
    const { data: sale, error } = await supabase
      .from('sales')
      .select('*')
      .eq('created_by', user.id)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !sale) return null;

    // Busca itens
    const { data: items } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', sale.id);

    // Busca pagamentos
    const { data: payments } = await supabase
      .from('sale_payments')
      .select('*')
      .eq('sale_id', sale.id);

    return {
      id: sale.id,
      saleType: sale.sale_type as 'product' | 'appointment',
      appointmentId: sale.appointment_id,
      clientName: sale.client_name,
      totalAmount: Number(sale.total_amount),
      items: (items ?? []).map((i) => ({
        id: i.id,
        itemType: i.item_type as 'product' | 'service',
        itemId: i.item_id,
        itemName: i.item_name,
        quantity: i.quantity,
        unitPrice: Number(i.unit_price),
        totalPrice: Number(i.total_price),
        isLocked: i.is_locked,
      })),
      payments: (payments ?? []).map((p) => ({
        id: p.id,
        paymentMethodId: p.payment_method_id,
        amount: Number(p.amount),
      })),
    };
  },
);