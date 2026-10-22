// src/features/clients/server/getClientHistory.ts
'use server';

import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import { parseBusinessError } from '@/lib/errors/parseBusinessError';
import { z } from 'zod';

const getClientHistorySchema = z.object({
  clientId: z.string().uuid(),
  page: z.coerce.number().positive().default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export const getClientHistory = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => getClientHistorySchema.parse(data))
  .handler(async ({ data }) => {
    const { clientId, page, pageSize } = data;
    const supabase = createSupabaseServer();

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data: appointments, error, count } = await supabase
        .from('appointments')
        .select(
          'id, starts_at, price, status, service:service_id(name), staff:staff_id(name)',
          { count: 'exact' }
        )
        .eq('client_id', clientId)
        .neq('status', 'cancelled')
        .order('starts_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const items = appointments.map((a) => ({
        id: a.id,
        starts_at: a.starts_at,
        service_name: (a.service as { name: string }[] | null)?.[0]?.name ?? null,
        staff_name: (a.staff as { name: string }[] | null)?.[0]?.name ?? null,
        price: a.price,
        status: a.status,
      }));

      return { items, total: count ?? 0 };
    } catch (error) {
      throw parseBusinessError(error);
    }
  });