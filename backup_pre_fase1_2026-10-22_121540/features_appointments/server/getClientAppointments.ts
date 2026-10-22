// src/features/appointments/server/getClientAppointments.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';

interface ClientAppointment {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  service_name: string;
  staff_name: string | null;
}

interface GetClientAppointmentsResult {
  items: ClientAppointment[];
  total: number;
}

export const getClientAppointments = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GetClientAppointmentsResult> => {
    const supabase = createSupabaseServer();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { items: [], total: 0 };
    }

    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (!client) {
      return { items: [], total: 0 };
    }

    const { data, error, count } = await supabase
      .from('appointments')
      .select(
        `
        id,
        starts_at,
        ends_at,
        status,
        service:service_id(name),
        staff:staff_id(profile:profile_id(full_name))
      `,
        { count: 'exact' },
      )
      .eq('client_id', client.id)
      .order('starts_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[getClientAppointments] Erro:', error);
      return { items: [], total: 0 };
    }

    const items: ClientAppointment[] = (data ?? []).map((row: any) => ({
      id: row.id,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      status: row.status,
      service_name: row.service?.name ?? 'Serviço',
      staff_name: row.staff?.profile?.full_name ?? null,
    }));

    return { items, total: count ?? items.length };
  },
);