// src/features/appointments/server/listClientsForSelect.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { ClientOption } from '../types';

export const listClientsForSelect = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) =>
    z.object({ q: z.string().max(100).default('') }).parse(data),
  )
  .handler(async ({ data }): Promise<ClientOption[]> => {
    const supabase = createSupabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[appointments] Sessão inválida.');
    }

    let query = supabase
      .from('clients')
      .select('id, full_name, phone');

    if (data.q) {
      const pattern = `%${data.q}%`;
      query = query.or(`full_name.ilike.${pattern},phone.ilike.${pattern}`);
    }

    const { data: rows, error } = await query
      .order('full_name', { ascending: true })
      .limit(50);

    if (error) throw error;

    return (rows ?? []).map((r: any) => ({
      id: r.id,
      name: r.full_name ?? 'Cliente',
      phone: r.phone,
    }));
  });