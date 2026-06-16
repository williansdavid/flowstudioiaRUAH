// src/features/staff/server/createTimeOff.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import {
  buildTimeOffConflicts,
  type TimeOffConflict,
} from './_buildTimeOffConflicts';

const createSchema = z
  .object({
    staffId: z.string().uuid('Profissional inválido'),
    startsAt: z.string().datetime({ offset: true }),
    endsAt: z.string().datetime({ offset: true }),
    reason: z.string().max(500).nullable().optional(),
  })
  .refine((d) => new Date(d.endsAt) > new Date(d.startsAt), {
    message: 'Horário final deve ser após o inicial.',
    path: ['endsAt'],
  });

export type CreateTimeOffInput = z.infer<typeof createSchema>;

export type CreateTimeOffResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'CONFLICT'; conflicts: TimeOffConflict[] }
  | { ok: false; reason: 'FORBIDDEN' };

export const createTimeOff = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data }): Promise<CreateTimeOffResult> => {
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

    const { data: inserted, error } = await supabase
      .from('staff_time_off')
      .insert({
        staff_id: data.staffId,
        starts_at: data.startsAt,
        ends_at: data.endsAt,
        reason: data.reason ?? null,
        created_by: user.id,
      })
      .select('id')
      .maybeSingle();

    // RLS barrou (não é admin nem dono do staff)
    if (error?.code === '42501') {
      return { ok: false, reason: 'FORBIDDEN' };
    }
    if (error) throw error;
    if (!inserted) {
      return { ok: false, reason: 'FORBIDDEN' };
    }

    return { ok: true, id: inserted.id };
  });
