// src/features/clients/server/listClients.ts
'use server'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createSupabaseServer } from '@/lib/supabase/server'
import { parseBusinessError } from '@/lib/errors/parseBusinessError'

const ListClientsInputSchema = z.object({
  page: z.coerce.number().positive().default(1),
  pageSize: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  status: z.enum(['active', 'vip', 'inactive', 'new']).optional(),
  birthdayMonth: z.coerce.number().min(1).max(12).optional(),
  hasAppointment: z.coerce.boolean().optional(),
  noPhone: z.coerce.boolean().optional(),
  neverReturned: z.coerce.boolean().optional(),
  lastCadastre: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'last_visit', 'total_spent', 'frequency_days']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type ListClientsInput = z.infer<typeof ListClientsInputSchema>

export type ClientListItem = {
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

export type ListClientsResponse = {
  clients: ClientListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const SORT_COLUMNS: Record<string, string> = {
  name: 'full_name',
  last_visit: 'last_visit',
  total_spent: 'total_spent',
  frequency_days: 'frequency_days',
}

export const listClients = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => ListClientsInputSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = createSupabaseServer()
    try {
      let query = supabase
        .from('clients')
        .select('*', { count: 'exact' })

      // ── Filtro: aniversariantes do mês (via RPC) ──
      if (data.birthdayMonth !== undefined) {
        const { data: birthdayIds, error: rpcError } = await supabase
          .rpc('get_clients_by_birth_month', { p_month: data.birthdayMonth })
        if (rpcError) throw rpcError
        const ids = (birthdayIds ?? []).map((r: { id: string }) => r.id)
        if (ids.length === 0) {
          return {
            clients: [],
            total: 0,
            page: data.page,
            pageSize: data.pageSize,
            totalPages: 0,
          }
        }
        query = query.in('id', ids)
      }

      // ── Filtros ──
      if (data.search) {
        const term = `%${data.search}%`
        query = query.or(
          `full_name.ilike.${term},phone.ilike.${term},cpf.ilike.${term},email.ilike.${term}`
        )
      }

      if (data.status) {
        if (data.status === 'vip') {
          query = query.or('total_spent.gt.1000,total_visits.gte.20')
        } else if (data.status === 'new') {
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          query = query.gte('first_visit', sevenDaysAgo.toISOString())
        } else {
          query = query.eq('status', data.status)
        }
      }

      if (data.noPhone) query = query.is('phone', null)
      if (data.neverReturned) query = query.eq('total_visits', 1)

      // ── Ordenação ──
      if (data.lastCadastre) {
        query = query.order('created_at', { ascending: false })
      } else {
        const sortCol = SORT_COLUMNS[data.sortBy] ?? 'full_name'
        query = query.order(sortCol, { ascending: data.sortOrder === 'asc' })
      }

      // ── Paginação ──
      const from = (data.page - 1) * data.pageSize
      const to = from + data.pageSize - 1
      query = query.range(from, to)

      const { data: clientsData, error: clientsError, count } = await query
      if (clientsError) throw clientsError

      // ── Agendamentos futuros (has_appointment) ──
      const clientIds = (clientsData ?? []).map((c) => c.id)
      let hasAppointmentSet = new Set<string>()
      if (clientIds.length > 0) {
        const now = new Date().toISOString()
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('client_id')
          .in('client_id', clientIds)
          .in('status', ['pending', 'confirmed'])
          .gte('starts_at', now)
        if (appointmentsError) throw appointmentsError
        hasAppointmentSet = new Set(
          (appointments ?? []).map((a) => a.client_id)
        )
      }
      // ── Ranking global por total_spent ──
      const { data: rankingData } = await supabase
        .from('clients')
        .select('id')
        .order('total_spent', { ascending: false, nullsFirst: false })
      const rankMap = new Map<string, number>()
      rankingData?.forEach((row, index) => {
        rankMap.set(row.id, index + 1)
      })

      const clients: ClientListItem[] = (clientsData ?? []).map((c) => {
        let nextVisitEstimated: string | null = null
        if (c.last_visit && c.frequency_days) {
          const lastVisitDate = new Date(c.last_visit)
          lastVisitDate.setDate(lastVisitDate.getDate() + c.frequency_days)
          nextVisitEstimated = lastVisitDate.toISOString()
        }
        return {
          id: c.id,
          name: c.full_name ?? null,
          phone: c.phone ?? null,
          email: c.email ?? null,
          avatar_url: c.avatar_url ?? null,
          last_visit: c.last_visit ?? null,
          total_visits: c.total_visits ?? null,
          total_spent: c.total_spent ?? null,
          frequency_days: c.frequency_days ?? null,
          status: c.status ?? null,
          tags: c.tags ?? null,
          next_visit_estimated: nextVisitEstimated,
          has_appointment: hasAppointmentSet.has(c.id),
          rank: rankMap.get(c.id) ?? 0,
        }
      })

      return {
        clients,
        total: count ?? 0,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: Math.ceil((count ?? 0) / data.pageSize),
      }
    } catch (error) {
      throw parseBusinessError(error)
    }
  })