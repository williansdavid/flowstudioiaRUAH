// src/features/appointments/server/getDayAppointments.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { AppointmentItem, AppointmentStatus } from '../types';

const inputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
});

export type GetDayAppointmentsInput = z.infer<typeof inputSchema>;

function dayRangeISO(date: string): { start: string; end: string } {
  // Parse 'YYYY-MM-DD' → [year, month, day]
  const parts = date.split('-');

  // ✅ CORREÇÃO: validar que parts tem exatamente 3 elementos
  if (parts.length !== 3) {
    throw new Error('Data inválida: use formato YYYY-MM-DD');
  }

  // ✅ CORREÇÃO: usar ! (non-null assertion) após validação
  const year = parseInt(parts[0]!, 10);
  const month = parseInt(parts[1]!, 10);
  const day = parseInt(parts[2]!, 10);

  // ✅ CORREÇÃO: validar que são números válidos
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error('Data inválida: year, month, day devem ser números');
  }

  // Cria Date em horário local (São Paulo UTC-3)
  const startLocal = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endLocal = new Date(year, month - 1, day, 23, 59, 59, 999);

  return {
    start: startLocal.toISOString(),
    end: endLocal.toISOString(),
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
      .lt('starts_at', end)
      .neq('status', 'cancelled')
      .order('starts_at', { ascending: true });

    if (error) throw error;

    return (rows as unknown as RawRow[]).map(mapRow);
  });