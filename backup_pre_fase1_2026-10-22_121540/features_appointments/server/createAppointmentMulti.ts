// src/features/appointments/server/createAppointmentMulti.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const serviceItemSchema = z.object({
  serviceId: z.string().uuid('Serviço inválido'),
  quantity: z.number().int().min(1, 'Quantidade deve ser maior que zero'),
});

const createSchema = z.object({
  clientId: z.string().uuid('Cliente inválido'),
  staffId: z.string().uuid('Profissional inválido'),
  startsAt: z.string(),
  services: z.array(serviceItemSchema).min(1, 'Informe ao menos um serviço'),
  notes: z.string().nullable().optional(),
  status: z.enum(['pending', 'confirmed']).optional(),
  paymentMethodId: z.string().uuid().nullable().optional(),
});

const updateSchema = z.object({
  appointmentId: z.string().uuid('Agendamento inválido'),
  clientId: z.string().uuid('Cliente inválido'),
  staffId: z.string().uuid('Profissional inválido'),
  startsAt: z.string(),
  services: z.array(serviceItemSchema).min(1, 'Informe ao menos um serviço'),
  notes: z.string().nullable().optional(),
  status: z.enum(['pending', 'confirmed']).optional(),
});

export const createAppointmentMulti = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const supabase = createSupabaseServer();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('[appointments] Sessão inválida.');

      const { data: result, error } = await supabase.rpc('create_appointment_multi_service', {
        p_client_id: data.clientId,
        p_staff_id: data.staffId,
        p_starts_at: data.startsAt,
        p_services: data.services,
        p_notes: data.notes ?? null,
        p_status: data.status ?? 'pending',
        p_payment_method_id: data.paymentMethodId ?? null,
      });

      if (error) throw error;
      return result;
    } catch (err) {
      const normalized: Error = err instanceof Error ? err : new Error(String(err));
      console.error('[createAppointmentMulti]', {
        errorName: normalized.name,
        errorMessage: normalized.message,
        timestamp: new Date().toISOString(),
      });
      throw err;
    }
  });

export const updateAppointmentMulti = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updateSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const supabase = createSupabaseServer();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('[appointments] Sessão inválida.');

      const { data: result, error } = await supabase.rpc('update_appointment_multi_service', {
        p_appointment_id: data.appointmentId,
        p_client_id: data.clientId,
        p_staff_id: data.staffId,
        p_starts_at: data.startsAt,
        p_services: data.services,
        p_notes: data.notes ?? null,
        p_status: data.status ?? null,
      });

      if (error) throw error;
      return result;
    } catch (err) {
      const normalized: Error = err instanceof Error ? err : new Error(String(err));
      console.error('[updateAppointmentMulti]', {
        errorName: normalized.name,
        errorMessage: normalized.message,
        timestamp: new Date().toISOString(),
      });
      throw err;
    }
  });