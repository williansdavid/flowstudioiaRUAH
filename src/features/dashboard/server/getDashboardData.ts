// src/features/dashboard/server/getDashboardData.ts
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import {
  INACTIVE_CLIENT_DAYS,
  POPULAR_SERVICES_LIMIT,
  RECENT_CLIENTS_LIMIT,
  REVENUE_SERIES_MONTHS,
} from '@/features/dashboard/types';
import type {
  DashboardData,
  DashboardAppointmentItem,
  DashboardLeadItem,
  KpiWithDelta,
  RevenuePoint,
  WeekDayPoint,
  PopularServiceItem,
  RecentClientItem,
} from '@/features/dashboard/types';

// ============================================================
// Helpers de data (UTC — consistente com o resto do arquivo)
// ============================================================

/** Início do mês corrente em ISO (UTC). */
function monthStartISO(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

/** Início do mês anterior em ISO (UTC). */
function prevMonthStartISO(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)).toISOString();
}

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

/** Corte de inatividade (now - N dias) em ISO. */
function inactiveCutoffISO(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - INACTIVE_CLIENT_DAYS);
  return d.toISOString();
}

/** Início da semana atual (segunda) e início da próxima segunda, em UTC. */
function weekRangeISO(): { start: Date; end: Date } {
  const now = new Date();
  const dow = now.getUTCDay(); // 0=dom ... 6=sáb
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diffToMonday),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return { start, end };
}

/** Início do mês N meses atrás (para a série de faturamento). */
function revenueSeriesStartISO(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (REVENUE_SERIES_MONTHS - 1), 1),
  ).toISOString();
}

/** Delta percentual vs. previous; `null` se previous === 0. */
function buildDelta(value: number, previous: number): KpiWithDelta {
  const deltaPct = previous === 0 ? null : ((value - previous) / previous) * 100;
  return { value, previous, deltaPct };
}

// ============================================================
// Shapes crus (embeds PostgREST)
// ============================================================

/** Embed de appointments (FKs: client_id, service_id, staff_id→profiles). */
interface RawAppointmentRow {
  id: string;
  starts_at: string;
  status: DashboardAppointmentItem['status'];
  clients: { full_name: string | null } | null;
  services: { name: string } | null;
  staff: { profiles: { full_name: string | null } | null } | null;
}

function mapAppointment(row: RawAppointmentRow): DashboardAppointmentItem {
  return {
    id: row.id,
    startsAt: row.starts_at,
    status: row.status,
    clientName: row.clients?.full_name ?? 'Cliente',
    serviceName: row.services?.name ?? 'Serviço',
    staffName: row.staff?.profiles?.full_name ?? 'Profissional',
  };
}

// ============================================================
// Server function
// ============================================================

export const getDashboardData = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DashboardData> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[dashboard] Sessão inválida.');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profileError || !profile) {
      throw new Error('[dashboard] Perfil não encontrado.');
    }

    const { start: todayStart, end: todayEnd } = todayRangeISO();
    const cutoff = inactiveCutoffISO();

    const apptSelect =
      'id, starts_at, status, clients(full_name), services(name), staff(profiles(full_name))';

    // ---- Clientes ativos/inativos (RLS: admin+staff leem tudo) ----
    const [activeRes, inactiveRes] = await Promise.all([
      supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .gte('last_visit_at', cutoff),
      supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .or(`last_visit_at.lt.${cutoff},last_visit_at.is.null`),
    ]);
    if (activeRes.error) throw activeRes.error;
    if (inactiveRes.error) throw inactiveRes.error;

    const activeClients = activeRes.count ?? 0;
    const inactiveClients = inactiveRes.count ?? 0;

    // ---- STAFF ----
    if (profile.role === 'staff') {
      const [todayCountRes, upcomingRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .gte('starts_at', todayStart)
          .lt('starts_at', todayEnd)
          .neq('status', 'cancelled'),
        supabase
          .from('appointments')
          .select(apptSelect)
          .gte('starts_at', todayStart)
          .lt('starts_at', todayEnd)
          .neq('status', 'cancelled')
          .order('starts_at', { ascending: true }),
      ]);
      if (todayCountRes.error) throw todayCountRes.error;
      if (upcomingRes.error) throw upcomingRes.error;

      return {
        role: 'staff',
        kpis: {
          todayAppointments: todayCountRes.count ?? 0,
          activeClients,
          inactiveClients,
        },
        upcomingAppointments: (
          upcomingRes.data as unknown as RawAppointmentRow[]
        ).map(mapAppointment),
      };
    }

    // ============================================================
    // ADMIN
    // ============================================================
    const monthStart = monthStartISO();
    const prevMonthStart = prevMonthStartISO();
    const { start: weekStart, end: weekEnd } = weekRangeISO();
    const seriesStart = revenueSeriesStartISO();

    const [
      revenueCurRes,
      revenuePrevRes,
      todayCountRes,
      monthLeadsRes,
      upcomingRes,
      recentLeadsRes,
      // KPIs com delta:
      ticketCurRes,
      ticketPrevRes,
      newClientsCurRes,
      newClientsPrevRes,
      // taxa de conclusão (mês):
      monthApptStatusRes,
      // séries:
      revenueSeriesRes,
      weekApptRes,
      // popular services (mês, completed):
      popularRes,
      // recent clients:
      recentClientsRes,
    ] = await Promise.all([
      // faturamento mês atual (income)
      supabase
        .from('finance_transactions')
        .select('amount')
        .eq('type', 'income')
        .gte('occurred_at', monthStart),
      // faturamento mês anterior
      supabase
        .from('finance_transactions')
        .select('amount')
        .eq('type', 'income')
        .gte('occurred_at', prevMonthStart)
        .lt('occurred_at', monthStart),
      // agendamentos hoje
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .gte('starts_at', todayStart)
        .lt('starts_at', todayEnd)
        .neq('status', 'cancelled'),
      // leads novos no mês
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', monthStart),
      // próximos (hoje)
      supabase
        .from('appointments')
        .select(apptSelect)
        .gte('starts_at', todayStart)
        .lt('starts_at', todayEnd)
        .neq('status', 'cancelled')
        .order('starts_at', { ascending: true }),
      // leads recentes
      supabase
        .from('leads')
        .select('id, name, phone, status, source, created_at')
        .in('status', ['new', 'contacted'])
        .order('created_at', { ascending: false })
        .limit(5),
      // ticket médio mês atual: appointments completed (price)
      supabase
        .from('appointments')
        .select('price')
        .eq('status', 'completed')
        .gte('starts_at', monthStart),
      // ticket médio mês anterior
      supabase
        .from('appointments')
        .select('price')
        .eq('status', 'completed')
        .gte('starts_at', prevMonthStart)
        .lt('starts_at', monthStart),
      // novos clientes mês atual
      supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', monthStart),
      // novos clientes mês anterior
      supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', prevMonthStart)
        .lt('created_at', monthStart),
      // status dos appointments do mês (p/ completion rate)
      supabase
        .from('appointments')
        .select('status')
        .gte('starts_at', monthStart),
      // série de faturamento 6 meses
      supabase
        .from('finance_transactions')
        .select('amount, occurred_at')
        .eq('type', 'income')
        .gte('occurred_at', seriesStart),
      // agendamentos da semana (p/ série diária)
      supabase
        .from('appointments')
        .select('starts_at, status')
        .gte('starts_at', weekStart.toISOString())
        .lt('starts_at', weekEnd.toISOString())
        .neq('status', 'cancelled'),
      // serviços populares (mês, completed)
      supabase
        .from('appointments')
        .select('service_id, services(name)')
        .eq('status', 'completed')
        .gte('starts_at', monthStart),
      // clientes recentes (por última visita)
      supabase
        .from('clients')
        .select('id, full_name, total_spent, last_visit_at')
        .not('last_visit_at', 'is', null)
        .order('last_visit_at', { ascending: false })
        .limit(RECENT_CLIENTS_LIMIT),
    ]);

    if (revenueCurRes.error) throw revenueCurRes.error;
    if (revenuePrevRes.error) throw revenuePrevRes.error;
    if (todayCountRes.error) throw todayCountRes.error;
    if (monthLeadsRes.error) throw monthLeadsRes.error;
    if (upcomingRes.error) throw upcomingRes.error;
    if (recentLeadsRes.error) throw recentLeadsRes.error;
    if (ticketCurRes.error) throw ticketCurRes.error;
    if (ticketPrevRes.error) throw ticketPrevRes.error;
    if (newClientsCurRes.error) throw newClientsCurRes.error;
    if (newClientsPrevRes.error) throw newClientsPrevRes.error;
    if (monthApptStatusRes.error) throw monthApptStatusRes.error;
    if (revenueSeriesRes.error) throw revenueSeriesRes.error;
    if (weekApptRes.error) throw weekApptRes.error;
    if (popularRes.error) throw popularRes.error;
    if (recentClientsRes.error) throw recentClientsRes.error;

    // ---- Faturamento (com delta) ----
    const sumAmount = (rows: { amount: number | string }[]) =>
      rows.reduce((s, t) => s + Number(t.amount), 0);
    const monthRevenue = buildDelta(
      sumAmount(revenueCurRes.data ?? []),
      sumAmount(revenuePrevRes.data ?? []),
    );

    // ---- Ticket médio (com delta) ----
    const avgOf = (rows: { price: number | string }[]) =>
      rows.length === 0
        ? 0
        : rows.reduce((s, r) => s + Number(r.price), 0) / rows.length;
    const avgTicket = buildDelta(
      avgOf(ticketCurRes.data ?? []),
      avgOf(ticketPrevRes.data ?? []),
    );

    // ---- Novos clientes (com delta) ----
    const newClients = buildDelta(
      newClientsCurRes.count ?? 0,
      newClientsPrevRes.count ?? 0,
    );

    // ---- Taxa de conclusão do mês ----
    const statuses = monthApptStatusRes.data ?? [];
    const completedCount = statuses.filter((r) => r.status === 'completed').length;
    const denom = statuses.filter((r) => r.status !== 'cancelled').length;
    const completionRate = denom === 0 ? null : (completedCount / denom) * 100;

    // ---- Série de faturamento (6 meses) ----
    const revenueByMonth = new Map<string, number>();
    for (let i = 0; i < REVENUE_SERIES_MONTHS; i++) {
      const now = new Date();
      const key = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (REVENUE_SERIES_MONTHS - 1) + i, 1),
      ).toISOString();
      revenueByMonth.set(key, 0);
    }
    for (const row of revenueSeriesRes.data ?? []) {
      const d = new Date(row.occurred_at);
      const key = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
      if (revenueByMonth.has(key)) {
        revenueByMonth.set(key, revenueByMonth.get(key)! + Number(row.amount));
      }
    }
    const revenueSeries: RevenuePoint[] = Array.from(revenueByMonth.entries()).map(
      ([month, revenue]) => ({ month, revenue }),
    );

    // ---- Série semanal (seg→dom) ----
    const weekByDay = new Map<string, { scheduled: number; completed: number }>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setUTCDate(d.getUTCDate() + i);
      weekByDay.set(d.toISOString(), { scheduled: 0, completed: 0 });
    }
    for (const row of weekApptRes.data ?? []) {
      const d = new Date(row.starts_at);
      const key = new Date(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
      ).toISOString();
      const bucket = weekByDay.get(key);
      if (bucket) {
        bucket.scheduled += 1;
        if (row.status === 'completed') bucket.completed += 1;
      }
    }
    const weekSeries: WeekDayPoint[] = Array.from(weekByDay.entries()).map(
      ([day, v]) => ({ day, scheduled: v.scheduled, completed: v.completed }),
    );

    // ---- Serviços populares (contagem, completed) ----
    interface RawPopularRow {
      service_id: string;
      services: { name: string } | null;
    }
    const popularMap = new Map<string, { name: string; count: number }>();
    for (const row of (popularRes.data ?? []) as unknown as RawPopularRow[]) {
      const existing = popularMap.get(row.service_id);
      if (existing) {
        existing.count += 1;
      } else {
        popularMap.set(row.service_id, {
          name: row.services?.name ?? 'Serviço',
          count: 1,
        });
      }
    }
    const popularServices: PopularServiceItem[] = Array.from(popularMap.entries())
      .map(([serviceId, v]) => ({ serviceId, serviceName: v.name, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, POPULAR_SERVICES_LIMIT);

    // ---- Último serviço concluído por cliente recente ----
    const recentClientRows = recentClientsRes.data ?? [];
    const recentClientIds = recentClientRows.map((c) => c.id);

    const lastServiceByClient = new Map<string, string>();
    if (recentClientIds.length > 0) {
      const { data: lastApptData, error: lastApptError } = await supabase
        .from('appointments')
        .select('client_id, starts_at, services(name)')
        .in('client_id', recentClientIds)
        .eq('status', 'completed')
        .order('starts_at', { ascending: false });
      if (lastApptError) throw lastApptError;

      interface RawLastApptRow {
        client_id: string;
        starts_at: string;
        services: { name: string } | null;
      }
      for (const row of (lastApptData ?? []) as unknown as RawLastApptRow[]) {
        // já vem ordenado desc → primeiro de cada cliente é o mais recente
        if (!lastServiceByClient.has(row.client_id)) {
          lastServiceByClient.set(row.client_id, row.services?.name ?? 'Serviço');
        }
      }
    }

    const recentClients: RecentClientItem[] = recentClientRows.map((c) => ({
      clientId: c.id,
      name: c.full_name ?? 'Cliente',
      lastServiceName: lastServiceByClient.get(c.id) ?? null,
      totalSpent: Number(c.total_spent),
      lastVisitAt: c.last_visit_at,
    }));

    // ---- Leads recentes ----
    const recentLeads: DashboardLeadItem[] = (recentLeadsRes.data ?? []).map((l) => ({
      id: l.id,
      name: l.name,
      phone: l.phone,
      status: l.status,
      source: l.source,
      createdAt: l.created_at,
    }));

    return {
      role: 'admin',
      kpis: {
        monthRevenue,
        todayAppointments: todayCountRes.count ?? 0,
        avgTicket,
        newClients,
        monthNewLeads: monthLeadsRes.count ?? 0,
        completionRate,
        activeClients,
        inactiveClients,
      },
      revenueSeries,
      weekSeries,
      popularServices,
      upcomingAppointments: (
        upcomingRes.data as unknown as RawAppointmentRow[]
      ).map(mapAppointment),
      recentLeads,
      recentClients,
    };
  },
);
