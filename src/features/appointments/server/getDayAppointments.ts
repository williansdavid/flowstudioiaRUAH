import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { AppointmentItem, AppointmentStatus } from '../types';

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

const APPT_SELECT =
  'id, starts_at, ends_at, status, price, notes, client_id, service_id, clients(full_name, phone), services(name), staff(id, color, profiles(full_name, avatar_url))';

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
    color: string | null;
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
      // Normaliza o erro — cast seguro pois instanceof já valida em runtime
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