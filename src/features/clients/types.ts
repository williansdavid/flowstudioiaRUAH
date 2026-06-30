// src/features/clients/types.ts
import type { UpdateClientInput } from './server/updateClient'

/* ───────── Lista ───────── */
export interface ClientListItem {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  avatar_url: string | null
  last_visit: string | null
  total_visits: number | null
  total_spent: number | null
  frequency_days: number | null
  status: string | null
  tags: string[] | null
  next_visit_estimated: string | null
  has_appointment: boolean
  rank: number
}

export interface ListClientsResponse {
  clients: ClientListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/* ───────── Alertas ───────── */
export interface AlertClient {
  id: string
  name: string | null
  phone: string | null
}

export interface AlertGroup {
  clients: AlertClient[]
  count: number
}

export interface ClientAlertsResponse {
  birthdayToday: AlertGroup
  inactive45d: AlertGroup
  vip: AlertGroup
  newThisWeek: AlertGroup
  noReturn: AlertGroup
}

/* ───────── Perfil (getClientProfile) ───────── */
export interface ClientProfile {
  client: {
    id: string
    name: string | null
    phone: string | null
    email: string | null
    birth_date: string | null
    cpf: string | null
    address: string | null
    notes: string | null
    tags: string[] | null
    avatar_url: string | null
    status: string | null
    created_at: string
    first_visit: string | null
    last_visit: string | null
    total_visits: number
    total_spent: number
    frequency_days: number | null
  }
  financial: {
    total_spent: number
    ticket_medio: number
    total_visits: number
    last_visit: string | null
    first_visit: string | null
    biggest_purchase: number | null
    balance: number | null
  }
  favorite_services: Array<{
    service_id: string
    service_name: string
    count: number
  }>
  favorite_staff: Array<{
    staff_id: string
    staff_name: string
    count: number
    percentage: number
  }>
  frequency_insights: {
    frequency_days: number | null
    next_visit_expected: string | null
    is_overdue: boolean
    days_since_last_visit: number | null
    abandonment_risk: 'low' | 'medium' | 'high'
  }
  ranking: {
    position: number
    total_clients: number
    percentile: number
  }
  indicators: {
    has_future_appointment: boolean
    never_returned: boolean
    cancelled_many: boolean
    is_vip: boolean
    is_birthday_today: boolean
  }
}

/* ───────── Histórico ───────── */
export interface ClientHistoryItem {
  id: string
  starts_at: string
  service_name: string | null
  staff_name: string | null
  price: number | null
  status: string
}

export interface ClientHistoryResponse {
  items: ClientHistoryItem[]
  total: number
}

/* ───────── Insights ───────── */
export type AbandonmentRisk = 'low' | 'medium' | 'high'

export interface ClientInsightsResponse {
  lifetime_value: number
  ticket_medio: number
  frequency_days: number | null
  time_as_client_days: number
  abandonment_risk: AbandonmentRisk
  ranking: {
    position: number
    total_clients: number
  }
}

/* ───────── Timeline ───────── */
export interface ClientTimelineEvent {
  id: string
  event_type: string
  metadata: Record<string, unknown> | null
  occurred_at: string
}

export interface ClientTimelineResponse {
  events: ClientTimelineEvent[]
}

/* ───────── Parâmetros de busca compartilhados ───────── */
export interface ClientQueryParams {
  page?: number
  pageSize?: number
  search?: string
  status?: 'active' | 'vip' | 'inactive' | 'new'
  birthdayMonth?: number
  hasAppointment?: boolean
  noPhone?: boolean
  neverReturned?: boolean
  lastCadastre?: boolean
  sortBy?: 'name' | 'last_visit' | 'total_spent' | 'frequency_days'
  sortOrder?: 'asc' | 'desc'
}

/* ───────── Re-export do update input ───────── */
export type { UpdateClientInput }

