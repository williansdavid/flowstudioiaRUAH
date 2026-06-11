// src/features/appointments/server/deleteAppointment.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const deleteSchema = z.object({
  id: z.string().uuid('ID inválido'),
  reason: z.string().max(500).nullable().optional(),
});

export type DeleteAppointmentInput = z.infer<typeof deleteSchema>;

export const deleteAppointment = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => deleteSchema.parse(data))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[appointments] Sessão inválida.');
    }

    const { data: updated, error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_reason: data.reason ?? null,
      })
      .eq('id', data.id)
      .select('id')
      .single();
    if (error) throw error;
    if (!updated) {
      throw new Error('[appointments] Agendamento não encontrado ou sem permissão.');
    }

    return { id: updated.id };
  });
