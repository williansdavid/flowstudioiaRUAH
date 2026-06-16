// src/features/staff/server/deleteTimeOff.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const deleteSchema = z.object({
  id: z.string().uuid('Folga inválida'),
});

export type DeleteTimeOffInput = z.infer<typeof deleteSchema>;

export type DeleteTimeOffResult =
  | { ok: true }
  | { ok: false; reason: 'NOT_FOUND_OR_FORBIDDEN' };

export const deleteTimeOff = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => deleteSchema.parse(data))
  .handler(async ({ data }): Promise<DeleteTimeOffResult> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[staff] Sessão inválida.');
    }

    const { data: deleted, error } = await supabase
      .from('staff_time_off')
      .delete()
      .eq('id', data.id)
      .select('id')
      .maybeSingle();

    if (error?.code === '42501') {
      return { ok: false, reason: 'NOT_FOUND_OR_FORBIDDEN' };
    }
    if (error) throw error;
    if (!deleted) {
      return { ok: false, reason: 'NOT_FOUND_OR_FORBIDDEN' };
    }

    return { ok: true };
  });
