// src/features/sales/server/listPaymentMethods.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';

export interface PaymentMethodItem {
  id: string;
  name: string;
  icon: string | null;
}

export const listPaymentMethods = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PaymentMethodItem[]> => {
    const supabase = createSupabaseServer();

    const { data, error } = await supabase
      .from('payment_methods')
      .select('id, name, icon')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;

    return data ?? [];
  },
);