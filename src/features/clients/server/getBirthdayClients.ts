// src/features/clients/server/getBirthdayClients.ts
'use server'
import { createServerFn } from '@tanstack/react-start'
import { createSupabaseServer } from '@/lib/supabase/server'
import { parseBusinessError } from '@/lib/errors/parseBusinessError'

export interface BirthdayClient {
  id: string
  name: string | null
  phone: string | null
  avatar_url: string | null
  total_spent: number | null
  total_visits: number | null
  frequency_days: number | null
  last_visit: string | null
  birth_date: string | null
}

export interface GetBirthdayClientsResponse {
  clients: BirthdayClient[]
}

export const getBirthdayClients = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const supabase = createSupabaseServer()
    const month = new Date().getMonth() + 1 // 1-12

    const { data: ids, error: rpcError } = await supabase
      .rpc('get_clients_by_birth_month', { p_month: month })
    if (rpcError) throw rpcError

    if (!ids || ids.length === 0) return { clients: [] }

    const { data, error } = await supabase
      .from('clients')
      .select('id, full_name, phone, avatar_url, total_spent, total_visits, frequency_days, last_visit, birth_date')
      .in('id', ids.map((r: { id: string }) => r.id))
      .order('full_name')
    if (error) throw error

    return {
      clients: (data ?? []).map((c) => ({
        id: c.id,
        name: c.full_name ?? null,
        phone: c.phone ?? null,
        avatar_url: c.avatar_url ?? null,
        total_spent: c.total_spent ?? null,
        total_visits: c.total_visits ?? null,
        frequency_days: c.frequency_days ?? null,
        last_visit: c.last_visit ?? null,
        birth_date: c.birth_date ?? null,
      })),
    }
  } catch (error) {
    throw parseBusinessError(error)
  }
})