import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const inputSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'completed', 'no_show', 'cancelled']),
});

type UpdateAppointmentInput = z.infer<typeof inputSchema>;

export const updateAppointmentStatus = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const { id, status } = data;
    const supabase = createSupabaseServer();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch appointment with relations
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select(
        `
        id,
        client_id,
        staff_id,
        service_id,
        scheduled_at,
        status,
        client:clients(id, name, phone, profile_id),
        staff:staff(id, profile_id, profile:profiles(id, full_name, avatar_url)),
        service:services(id, name)
      `
      )
      .eq('id', id)
      .single();

    if (fetchError || !appointment) {
      throw new Error('Appointment not found');
    }

    // Update appointment status
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (updateError) {
      throw new Error(`Failed to update appointment: ${updateError.message}`);
    }

    // Extract data for response (handle array relations)
    const client = Array.isArray(appointment.client)
      ? appointment.client[0]
      : appointment.client;
    const staff = Array.isArray(appointment.staff)
      ? appointment.staff[0]
      : appointment.staff;
    const service = Array.isArray(appointment.service)
      ? appointment.service[0]
      : appointment.service;

    const staffProfile = staff?.profile
      ? Array.isArray(staff.profile)
        ? staff.profile[0]
        : staff.profile
      : null;

    return {
      success: true,
      appointment: {
        id: appointment.id,
        status,
        clientId: client?.id,
        clientName: client?.name,
        clientPhone: client?.phone,
        serviceId: service?.id,
        serviceName: service?.name,
        staffId: staff?.id,
        staffName: staffProfile?.full_name,
        staffAvatarUrl: staffProfile?.avatar_url || '',
        scheduledAt: appointment.scheduled_at,
      },
    };
  });