// src/features/dashboard/types.ts


export interface RevenueByStaffItem {
  staffId: string | null;
  staffName: string;
  total: number;
  color: string;
}

export interface RevenueByStaffItem {
  staffId: string | null;
  staffName: string;
  total: number;
}


export interface DashboardLeadItem {
  id: string;
  name: string;
  phone: string;
  status: 'new' | 'contacted' | 'scheduled' | 'converted' | 'lost';
  source: 'landing' | 'whatsapp' | 'instagram' | 'referral' | 'other';
  createdAt: string;
}

/** KPI com comparação contra período anterior. */
export interface KpiWithDelta {
  value: number;
  previous: number;
  /** Variação % vs. previous. `null` quando previous === 0. */
  deltaPct: number | null;
}

/** Ponto da série de faturamento mensal (6 meses). */
export interface RevenuePoint {
  /** Primeiro dia do mês em ISO (UTC). */
  month: string;
  revenue: number;
}

/** Ponto da série de agendamentos por dia (semana atual). */
export interface WeekDayPoint {
  /** Início do dia em ISO (UTC). */
  day: string;
  scheduled: number;
  completed: number;
}

/** Serviço mais agendado (por contagem de atendimentos concluídos). */
export interface PopularServiceItem {
  serviceId: string;
  serviceName: string;
  count: number;
}

/** Linha do bloco "clientes recentes". */
export interface RecentClientItem {
  clientId: string;
  name: string;
  lastServiceName: string | null;
  totalSpent: number;
  lastVisitAt: string | null;
}

export interface AdminDashboardData {
  role: 'admin';
  kpis: {
    monthRevenue: KpiWithDelta;
    todayAppointments: number;
    avgTicket: KpiWithDelta;
    newClients: KpiWithDelta;
    monthNewLeads: number;
    /** Conclusão do mês: completed / (total - cancelled). 0–100. `null` se denom 0. */
    completionRate: number | null;
    activeClients: number;
    inactiveClients: number;
  };
  revenueSeries: RevenuePoint[];
  weekSeries: WeekDayPoint[];
  popularServices: PopularServiceItem[];
  recentLeads: DashboardLeadItem[];
  recentClients: RecentClientItem[];
}

export interface StaffDashboardData {
  role: 'staff';
  kpis: {
    todayAppointments: number;
    activeClients: number;
    inactiveClients: number;
  }; 
}

export type DashboardData = AdminDashboardData | StaffDashboardData;

export const INACTIVE_CLIENT_DAYS = 60;
export const POPULAR_SERVICES_LIMIT = 5;
export const RECENT_CLIENTS_LIMIT = 5;
export const REVENUE_SERIES_MONTHS = 6;
