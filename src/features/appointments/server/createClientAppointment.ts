import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const inputSchema = z.object({
  serviceId: z.string().uuid('Serviço inválido'),
  staffId: z.string().uuid('Profissional inválido'),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  notes: z.string().max(1000).nullable().optional(),
});

export type CreateClientAppointmentInput = z.infer<typeof inputSchema>;

export const createClientAppointment = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[appointments] Sessão inválida.');
    }

    // Resolve clientId a partir da sessão (segurança: só agenda pra si)
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (!client) {
      throw new Error(
        'Perfil de cliente não encontrado. Entre em contato com o estabelecimento.',
      );
    }

    // Puxa price do serviço (fonte da verdade, igual createAppointment)
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
        client_id: client.id,
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