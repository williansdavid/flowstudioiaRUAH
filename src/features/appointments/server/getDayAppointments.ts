// src/features/appointments/server/getDayAppointments.ts
//
// CORREÇÃO BUG DIA -1 (lado servidor):
// new Date(year, month-1, day) cria a data no fuso LOCAL do processo (UTC em prod).
// Range ficava 00:00Z–23:59Z, mas agendamentos de SP das 21h em diante ficam
// armazenados em UTC do dia seguinte (ex: 21h SP = 00:00Z+1dia).
// Solução: offset explícito "-03:00" cobre o dia completo no fuso de São Paulo.

import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { AppointmentItem, AppointmentStatus } from '../types';

const inputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
});

export type GetDayAppointmentsInput = z.infer<typeof inputSchema>;

/**
 * ✅ CORREÇÃO: range UTC que cobre o dia completo no fuso de São Paulo (UTC-3).
 *
 * "2024-01-15" SP:
 *   início = 2024-01-15T00:00:00-03:00 = 2024-01-15T03:00:00Z
 *   fim    = 2024-01-15T23:59:59-03:00 = 2024-01-16T02:59:59Z
 */
function dayRangeISO(date: string): { start: string; end: string } {
  const start = new Date(`${date}T00:00:00-03:00`);
  const end = new Date(`${date}T23:59:59.999-03:00`);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

const APPT_SELECT =
  'id, starts_at, ends_at, status, price, notes, client_id, service_id, clients(full_name, phone), services(name), staff(id, profiles(full_name, avatar_url))';

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
  staff: {
    id: string;
    profiles: { full_name: string | null; avatar_url: string | null } | null;
  } | null;
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
    staffAvatarUrl: row.staff?.profiles?.avatar_url ?? null,
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
      .lte('starts_at', end)
      .neq('status', 'cancelled')
      .order('starts_at', { ascending: true });

    if (error) throw error;

    return (rows as unknown as RawRow[]).map(mapRow);
  });
