// src/features/appointments/server/createAppointment.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const createSchema = z
  .object({
    clientId: z.string().uuid('Cliente inválido'),
    serviceId: z.string().uuid('Serviço inválido'),
    staffId: z.string().uuid('Profissional inválido'),
    startsAt: z.string().datetime({ offset: true }),
    endsAt: z.string().datetime({ offset: true }),
    notes: z.string().max(1000).nullable().optional(),
  })
  .refine((d) => new Date(d.endsAt) > new Date(d.startsAt), {
    message: 'Horário final deve ser após o inicial.',
    path: ['endsAt'],
  });

export type CreateAppointmentInput = z.infer<typeof createSchema>;

export const createAppointment = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[appointments] Sessão inválida.');
    }

    // price é NOT NULL — puxa do serviço (fonte da verdade).
    const { data: service, error: svcError } = await supabase
      .from('services')
      .select('price')
      .eq('id', data.serviceId)
      .single();
    if (svcError || !service) {
      throw new Error('[appointments] Serviço não encontrado.');
    }

    const { data: inserted, error } = await supabase
      .from('appointments')
      .insert({
        client_id: data.clientId,
        service_id: data.serviceId,
        staff_id: data.staffId,
        starts_at: data.startsAt,
        ends_at: data.endsAt,
        price: Number(service.price),
        notes: data.notes ?? null,
        status: 'pending',
        created_by: user.id,
      })
      .select('id')
      .single();
    if (error) throw error;
    if (!inserted) {
      throw new Error('[appointments] Falha ao criar agendamento.');
    }

    return { id: inserted.id };
  });
