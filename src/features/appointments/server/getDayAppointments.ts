// src/features/appointments/server/getDayAppointments.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { AppointmentItem, AppointmentStatus, AppointmentServiceItem } from '../types';

const inputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
});

export type GetDayAppointmentsInput = z.infer<typeof inputSchema>;

function dayRangeISO(date: string): { start: string; end: string } {
  const start = new Date(`${date}T00:00:00-03:00`);
  const end = new Date(`${date}T23:59:59.999-03:00`);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

// Busca os serviços aninhados (appointment_services) + fallback legado (services)
// para agendamentos antigos de 1 serviço (backfill mantém service_id preenchido).
const APPT_SELECT =
  'id, starts_at, ends_at, status, price, notes, client_id, service_id, ' +
  'clients(full_name, phone), services(name), ' +
  'appointment_services(service_id, service_name, duration_minutes, price, quantity), ' +
  'staff(id, color, profiles(full_name, avatar_url))';

interface RawServiceRow {
  service_id: string;
  service_name: string;
  duration_minutes: number;
  price: number;
  quantity: number;
}

interface RawRow {
  id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  price: number;
  notes: string | null;
  client_id: string;
  service_id: string | null;
  clients: { full_name: string | null; phone: string | null } | null;
  services: { name: string } | null;
  appointment_services: RawServiceRow[] | null;
  staff: {
    id: string;
    color: string | null;
    profiles: { full_name: string | null; avatar_url: string | null } | null;
  } | null;
}

function mapRow(row: RawRow): AppointmentItem {
  const services: AppointmentServiceItem[] = (row.appointment_services ?? []).map((s) => ({
    serviceId: s.service_id,
    serviceName: s.service_name,
    durationMinutes: Number(s.duration_minutes),
    price: Number(s.price),
    quantity: Number(s.quantity),
  }));

  // serviceId único: NULL em multi (fonte da verdade = appointment_services);
  // fallback para agendamentos antigos de 1 serviço via service_id.
  const serviceId = services.length > 0 ? null : (row.service_id ?? null);

  // serviceName: fallback legado (1 serviço) ou "Múltiplos serviços" quando 2+.
  let serviceName: string;
  if (services.length > 1) {
    serviceName = 'Múltiplos serviços';
  } else if (services.length === 1) {
    serviceName = services[0]?.serviceName ?? row.services?.name ?? 'Serviço';
  } else {
    serviceName = row.services?.name ?? 'Serviço';
  }

  return {
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    clientId: row.client_id,
    clientName: row.clients?.full_name ?? 'Cliente',
    clientPhone: row.clients?.phone ?? null,
    serviceId,
    serviceName,
    services,
    staffId: row.staff?.id ?? 'unknown',
    staffName: row.staff?.profiles?.full_name ?? 'Profissional',
    staffAvatarUrl: row.staff?.profiles?.avatar_url ?? null,
    staffColor: row.staff?.color ?? null,
    price: Number(row.price),
    notes: row.notes,
  };
}

export const getDayAppointments = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<AppointmentItem[]> => {
    try {
      const supabase = createSupabaseServer();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('[appointments] Sessão inválida.');
      }
      const { start, end } = dayRangeISO(data.date);
      if (start === 'Invalid Date' || end === 'Invalid Date') {
        throw new RangeError(
          `[appointments] dayRangeISO produziu data inválida para date="${data.date}". ` +
            `start=${start} end=${end}`
        );
      }
      const { data: rows, error } = await supabase
        .from('appointments')
        .select(APPT_SELECT)
        .gte('starts_at', start)
        .lte('starts_at', end)
        .order('starts_at', { ascending: true });
      if (error) throw error;
      return (rows as unknown as RawRow[]).map(mapRow);
    } catch (err) {
      const normalized: Error = err instanceof Error ? (err as Error) : new Error(String(err));
      console.error('[getDayAppointments]', {
        inputDate: data.date,
        rangeStart: (() => {
          try { return dayRangeISO(data.date).start } catch { return 'erro_ao_calcular' }
        })(),
        rangeEnd: (() => {
          try { return dayRangeISO(data.date).end } catch { return 'erro_ao_calcular' }
        })(),
        errorName: normalized.name,
        errorMessage: normalized.message,
        stack: normalized.stack?.split('\n').slice(0, 6).join('\n'),
        timestamp: new Date().toISOString(),
      });
      throw err;
    }
  });