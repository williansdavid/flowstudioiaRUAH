// src/features/appointments/server/listClientsForSelect.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { ClientOption } from '../types';

interface RawRow {
  id: string;
  full_name: string | null;
  phone: string | null;
}

export const listClientsForSelect = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ClientOption[]> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[appointments] Sessão inválida.');
    }

    const { data, error } = await supabase
      .from('clients')
      .select('id, full_name, phone')
      .order('full_name', { ascending: true });
    if (error) throw error;

    return (data as unknown as RawRow[]).map((r) => ({
      id: r.id,
      name: r.full_name ?? 'Cliente',
      phone: r.phone,
    }));
  },
);
