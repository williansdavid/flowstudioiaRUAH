// src/features/clients/server/getClientTimeline.ts
'use server';

import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import { parseBusinessError } from '@/lib/errors/parseBusinessError';
import { z } from 'zod';

const schema = z.object({
  clientId: z.string().uuid(),
});

export const getClientTimeline = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data: { clientId } }) => {
    const supabase = createSupabaseServer();

    const { data: events, error } = await supabase
      .from('client_events')
      .select('id, event_type, metadata, occurred_at')
      .eq('client_id', clientId)
      .order('occurred_at', { ascending: false });

    if (error) {
      throw parseBusinessError('DATABASE_ERROR', error.message);
    }

            return {
      events: (events ?? []).map((event) => ({
        id: event.id,
        event_type: event.event_type,
        metadata: (event.metadata ?? null) as Record<string, unknown> | null,
        occurred_at: event.occurred_at,
      })),
    } as any;
  });