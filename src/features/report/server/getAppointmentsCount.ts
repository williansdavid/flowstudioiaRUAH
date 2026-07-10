// src/features/report/server/getAppointmentsCount.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const inputSchema = z.object({
  start: z.string(),
  end: z.string(),
});

export const getAppointmentsCount = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<number> => {
    const supabase = createSupabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('[report] Sessão inválida.');
    }

    const { data: count, error } = await supabase.rpc('get_appointments_count', {
      p_start_date: data.start,
      p_end_date: data.end,
    });

    if (error) throw error;
    return Number(count ?? 0);
  });