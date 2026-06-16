// src/features/staff/server/updateTimeOff.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import {
  buildTimeOffConflicts,
  type TimeOffConflict,
} from './_buildTimeOffConflicts';

const updateSchema = z
  .object({
    id: z.string().uuid('Folga inválida'),
    staffId: z.string().uuid('Profissional inválido'),
    startsAt: z.string().datetime({ offset: true }),
    endsAt: z.string().datetime({ offset: true }),
    reason: z.string().max(500).nullable().optional(),
  })
  .refine((d) => new Date(d.endsAt) > new Date(d.startsAt), {
    message: 'Horário final deve ser após o inicial.',
    path: ['endsAt'],
  });

export type UpdateTimeOffInput = z.infer<typeof updateSchema>;

export type UpdateTimeOffResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'CONFLICT'; conflicts: TimeOffConflict[] }
  | { ok: false; reason: 'NOT_FOUND_OR_FORBIDDEN' };

export const updateTimeOff = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updateSchema.parse(data))
  .handler(async ({ data }): Promise<UpdateTimeOffResult> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[staff] Sessão inválida.');
    }

    const conflicts = await buildTimeOffConflicts(
      supabase,
      data.staffId,
      data.startsAt,
      data.endsAt,
    );
    if (conflicts.length > 0) {
      return { ok: false, reason: 'CONFLICT', conflicts };
    }

    const { data: updated, error } = await supabase
      .from('staff_time_off')
      .update({
        starts_at: data.startsAt,
        ends_at: data.endsAt,
        reason: data.reason ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)
      .select('id')
      .maybeSingle();

    if (error?.code === '42501') {
      return { ok: false, reason: 'NOT_FOUND_OR_FORBIDDEN' };
    }
    if (error) throw error;
    // null = id inexistente OU RLS barrou (mesma resposta pro cliente)
    if (!updated) {
      return { ok: false, reason: 'NOT_FOUND_OR_FORBIDDEN' };
    }

    return { ok: true, id: updated.id };
  });
