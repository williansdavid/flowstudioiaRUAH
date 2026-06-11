// src/features/appointments/server/updateAppointmentStatus.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { AppointmentItem } from '../types';

const updateStatusSchema = z.object({
  id: z.string().uuid('ID inválido'),
  status: z.enum([
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'no_show',
  ]),
});

export type UpdateAppointmentStatusInput = z.infer<typeof updateStatusSchema>;

/**
 * Atualiza o status de um agendamento.
 * RLS no banco é a defesa: admin/staff alteram qualquer um; client só o dele.
 */
export const updateAppointmentStatus = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updateStatusSchema.parse(data))
  .handler(async ({ data }): Promise<{ id: string; status: AppointmentItem['status'] }> => {
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
      .update({ status: data.status })
      .eq('id', data.id)
      .select('id, status')
      .single();
    if (error) throw error;
    if (!updated) {
      throw new Error('[appointments] Agendamento não encontrado ou sem permissão.');
    }

    return updated as { id: string; status: AppointmentItem['status'] };
  });
