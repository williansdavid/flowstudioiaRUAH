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
 * Admin atualiza qualquer um; staff só os próprios.
 * RLS no banco é a defesa real — este gate é UX/early-fail.
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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profileError || !profile) {
      throw new Error('[appointments] Perfil não encontrado.');
    }

    let query = supabase
      .from('appointments')
      .update({ status: data.status })
      .eq('id', data.id);

    // Staff só altera agendamento dele.
    if (profile.role === 'staff') {
      const { data: staffRow, error: staffError } = await supabase
        .from('staff')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();
      if (staffError) throw staffError;
      if (!staffRow) {
        throw new Error('[appointments] Acesso negado.');
      }
      query = query.eq('staff_id', staffRow.id);
    }

    const { data: updated, error } = await query
      .select('id, status')
      .single();
    if (error) throw error;
    if (!updated) {
      throw new Error('[appointments] Agendamento não encontrado ou sem permissão.');
    }

    return updated as { id: string; status: AppointmentItem['status'] };
  });
