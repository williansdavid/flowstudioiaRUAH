// src/features/appointments/server/updateAppointment.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { TablesUpdate } from '@/lib/supabase/types';

const updateSchema = z
  .object({
    id: z.string().uuid('ID inválido'),
    staffId: z.string().uuid().optional(),
    serviceId: z.string().uuid().optional(),
    startsAt: z.string().datetime({ offset: true }).optional(),
    endsAt: z.string().datetime({ offset: true }).optional(),
    notes: z.string().max(1000).nullable().optional(),
  })
  .refine(
    (d) =>
      !(d.startsAt && d.endsAt) || new Date(d.endsAt) > new Date(d.startsAt),
    { message: 'Horário final deve ser após o inicial.', path: ['endsAt'] },
  );

export type UpdateAppointmentInput = z.infer<typeof updateSchema>;

export const updateAppointment = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updateSchema.parse(data))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[appointments] Sessão inválida.');
    }

    const patch: TablesUpdate<'appointments'> = {};
    if (data.staffId !== undefined) patch.staff_id = data.staffId;
    if (data.startsAt !== undefined) patch.starts_at = data.startsAt;
    if (data.endsAt !== undefined) patch.ends_at = data.endsAt;
    if (data.notes !== undefined) patch.notes = data.notes;

    // Trocar serviço re-sincroniza price.
    if (data.serviceId !== undefined) {
      const { data: service, error: svcError } = await supabase
        .from('services')
        .select('price')
        .eq('id', data.serviceId)
        .single();
      if (svcError || !service) {
        throw new Error('[appointments] Serviço não encontrado.');
      }
      patch.service_id = data.serviceId;
      patch.price = Number(service.price);
    }

    if (Object.keys(patch).length === 0) {
      throw new Error('[appointments] Nada para atualizar.');
    }

    const { data: updated, error } = await supabase
      .from('appointments')
      .update(patch)
      .eq('id', data.id)
      .select('id')
      .single();
    if (error) throw error;
    if (!updated) {
      throw new Error('[appointments] Agendamento não encontrado ou sem permissão.');
    }

    return { id: updated.id };
  });
