// src/features/appointments/server/getDayAppointments.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { AppointmentItem, AppointmentStatus } from '../types';

const inputSchema = z.object({
  // 'YYYY-MM-DD' no fuso local do studio
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
});

export type GetDayAppointmentsInput = z.infer<typeof inputSchema>;

/** Range UTC [00:00, 24h) do dia informado, interpretado em America/Sao_Paulo (UTC-3). */
function dayRangeISO(date: string): { start: string; end: string } {
  // Studio opera em UTC-3 fixo. 00:00 local = 03:00 UTC.
  const start = new Date(`${date}T00:00:00-03:00`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

const APPT_SELECT =
  'id, starts_at, ends_at, status, price, notes, client_id, service_id, clients(full_name, phone), services(name), staff(id, profiles(full_name))';

interface RawRow {
  id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  price: number;
  notes: string | null;
  client_id: string;
  service_id: string;
  clients: { full_name: string | null; phone: string | null } | null;
  services: { name: string } | null;
  staff: { id: string; profiles: { full_name: string | null } | null } | null;
}

function mapRow(row: RawRow): AppointmentItem {
  return {
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    clientId: row.client_id,
    clientName: row.clients?.full_name ?? 'Cliente',
    clientPhone: row.clients?.phone ?? null,
    serviceId: row.service_id,
    serviceName: row.services?.name ?? 'Serviço',
    staffId: row.staff?.id ?? 'unknown',
    staffName: row.staff?.profiles?.full_name ?? 'Profissional',
    price: Number(row.price),
    notes: row.notes,
  };
}

export const getDayAppointments = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<AppointmentItem[]> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[appointments] Sessão inválida.');
    }

    const { start, end } = dayRangeISO(data.date);

    const { data: rows, error } = await supabase
      .from('appointments')
      .select(APPT_SELECT)
      .gte('starts_at', start)
      .lt('starts_at', end)
      .neq('status', 'cancelled')
      .order('starts_at', { ascending: true });
    if (error) throw error;

    return (rows as unknown as RawRow[]).map(mapRow);
  });
