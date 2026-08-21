// src/features/sales/server/getAppointmentSaleData.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const inputSchema = z.object({
  appointmentId: z.string().uuid(),
});

export interface AppointmentSaleServiceItem {
  serviceId: string;
  serviceName: string;
  price: number;
  quantity: number;
}

export interface AppointmentSaleData {
  appointmentId: string;
  clientName: string;
  serviceName: string;      // fallback: "Múltiplos serviços" ou nome do 1º item
  servicePrice: number;     // soma dos itens (ou price do appointment)
  serviceId: string | null; // null em multi-serviço
  staffId: string;
  services: AppointmentSaleServiceItem[]; // lista real de serviços (multi)
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
        clients!left(
          profile_id,
          profiles!left(full_name)
        ),
        appointment_services(
          service_id,
          quantity,
          services!left(name, price)
        )
      `)
      .eq('id', data.appointmentId)
      .maybeSingle();

    if (error) {
      console.error('[getAppointmentSaleData] Erro ao buscar agendamento:', error?.message);
      throw new Error('Erro ao buscar dados do agendamento.');
    }

    if (!appointment) {
      console.error('[getAppointmentSaleData] Agendamento não encontrado:', data.appointmentId);
      throw new Error('Agendamento não encontrado.');
    }

    // Embeds PostgREST vêm como array → extrai o [0] de cada nível
    const clientData = Array.isArray(appointment.clients)
      ? appointment.clients[0]
      : appointment.clients;
    const profileData = Array.isArray(clientData?.profiles)
      ? clientData?.profiles?.[0]
      : clientData?.profiles;

    const clientName = profileData?.full_name ?? 'Cliente';

    // Itens reais (multi-serviço) — prioridade sobre o service_id legado
    const items: AppointmentSaleServiceItem[] = (appointment.appointment_services ?? [])
      .filter((item) => item?.service_id)
      .map((item) => {
        // services também é embed array → extrai o [0]
        const serviceData = Array.isArray(item.services)
          ? item.services?.[0]
          : item.services;
        return {
          serviceId: item.service_id as string,
          serviceName: serviceData?.name ?? 'Serviço',
          price: serviceData?.price ?? 0,
          quantity: item.quantity ?? 1,
        };
      });

    const isMulti = items.length > 0;

    // Soma dos itens; fallback para o preço gravado no appointment
    const servicePrice = isMulti
      ? items.reduce((acc, item) => acc + item.price * item.quantity, 0)
      : Number(appointment.price ?? 0);

    return {
      appointmentId: data.appointmentId,
      clientName,
      serviceName: isMulti
        ? 'Múltiplos serviços'
        : (items[0]?.serviceName ?? 'Serviço'),
      servicePrice,
      serviceId: isMulti ? null : (appointment.service_id ?? null),
      staffId: appointment.staff_id,
      services: items,
    };
  });