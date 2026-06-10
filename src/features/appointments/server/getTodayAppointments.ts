// src/features/appointments/server/getTodayAppointments.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { AppointmentItem } from '../types';

/** Início e fim do dia corrente em ISO (UTC). */
function todayRangeISO(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

const APPT_SELECT =
  'id, starts_at, status, clients(full_name, phone), services(name), staff(id, profiles(full_name))';

interface RawAppointmentRow {
  id: string;
  starts_at: string;
  status: AppointmentItem['status'];
  clients: { full_name: string | null; phone: string | null } | null;
  services: { name: string } | null;
  staff: { id: string; profiles: { full_name: string | null } | null } | null;
}

function mapAppointment(row: RawAppointmentRow): AppointmentItem {
  return {
    id: row.id,
    startsAt: row.starts_at,
    status: row.status,
    clientName: row.clients?.full_name ?? 'Cliente',
    clientPhone: row.clients?.phone ?? null,
    serviceName: row.services?.name ?? 'Serviço',
    staffId: row.staff?.id ?? 'unknown',
    staffName: row.staff?.profiles?.full_name ?? 'Profissional',
  };
}

export const getTodayAppointments = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AppointmentItem[]> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[appointments] Sessão inválida.');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profileError || !profile) {
      throw new Error('[appointments] Perfil não encontrado.');
    }

    const { start: todayStart, end: todayEnd } = todayRangeISO();

    let query = supabase
      .from('appointments')
      .select(APPT_SELECT)
      .gte('starts_at', todayStart)
      .lt('starts_at', todayEnd)
      .neq('status', 'cancelled')
      .order('starts_at', { ascending: true });

    // Staff vê só os agendamentos dele. Admin vê todos.
    if (profile.role === 'staff') {
      const { data: staffRow, error: staffError } = await supabase
        .from('staff')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();
      if (staffError) throw staffError;
      // Sem registro em staff → nada pra mostrar.
      if (!staffRow) return [];

      query = query.eq('staff_id', staffRow.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data as unknown as RawAppointmentRow[]).map(mapAppointment);
  },
);
