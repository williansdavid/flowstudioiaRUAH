// src/features/sales/server/getAppointmentSaleData.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const inputSchema = z.object({
  appointmentId: z.string().uuid(),
});

export interface AppointmentSaleData {
  clientName: string;
  serviceName: string;
  servicePrice: number;
  serviceId: string;        // ← ADICIONADO
  staffId: string;
}

export const getAppointmentSaleData = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<AppointmentSaleData> => {
    const supabase = createSupabaseServer();

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        id,
        client_id,
        service_id,
        price,
        staff_id,
        clients!left(full_name),
        services!left(name)
      `)
      .eq('id', data.appointmentId)
      .single();

    if (error || !appointment) {
      console.error('[getAppointmentSaleData] Erro ao buscar agendamento:', error?.message);
      throw new Error('Agendamento não encontrado.');
    }

    const clientData = Array.isArray(appointment.clients)
      ? appointment.clients[0]
      : appointment.clients;

    const serviceData = Array.isArray(appointment.services)
      ? appointment.services[0]
      : appointment.services;

    if (!clientData?.full_name) {
      console.error('[getAppointmentSaleData] Cliente não encontrado para appointment:', data.appointmentId);
      throw new Error('Cliente do agendamento não encontrado.');
    }

    if (!serviceData?.name) {
      console.error('[getAppointmentSaleData] Serviço não encontrado para appointment:', data.appointmentId);
      throw new Error('Serviço do agendamento não encontrado.');
    }

    return {
      clientName: clientData.full_name,
      serviceName: serviceData.name,
      servicePrice: Number(appointment.price),
      serviceId: appointment.service_id,   // ← ADICIONADO
      staffId: appointment.staff_id,
    };
  });