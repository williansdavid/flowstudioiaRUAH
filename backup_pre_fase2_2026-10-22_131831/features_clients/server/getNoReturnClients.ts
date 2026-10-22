// src/features/clients/server/getNoReturnClients.ts
'use server'
import { createServerFn } from '@tanstack/react-start'
import { createSupabaseServer } from '@/lib/supabase/server'
import { parseBusinessError } from '@/lib/errors/parseBusinessError'

export interface NoReturnClient {
  id: string
  name: string | null
  phone: string | null
  avatar_url: string | null
  last_visit: string | null
  total_spent: number | null
  service_name: string | null
  staff_name: string | null
  appointment_price: number | null
  appointment_date: string | null
}

export interface GetNoReturnClientsResponse {
  clients: NoReturnClient[]
}

export const getNoReturnClients = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const supabase = createSupabaseServer()

    const { data, error } = await supabase
      .from('clients')
      .select(`
        id,
        full_name,
        phone,
        avatar_url,
        last_visit,
        total_spent,
        appointments!inner(
          starts_at,
          price,
          service:service_id(name),
          staff:staff_id(full_name)
        )
      `)
      .eq('total_visits', 1)
      .order('last_visit', { ascending: false, nullsFirst: false })

    if (error) throw error

    return {
      clients: (data ?? []).map((c) => {
        const appt = c.appointments?.[0]
        return {
          id: c.id,
          name: c.full_name ?? null,
          phone: c.phone ?? null,
          avatar_url: c.avatar_url ?? null,
          last_visit: c.last_visit ?? null,
          total_spent: c.total_spent ?? null,
          service_name: (appt?.service as { name?: string } | undefined)?.name ?? null,
          staff_name: (appt?.staff as { full_name?: string } | undefined)?.full_name ?? null,
          appointment_price: appt?.price ?? null,
          appointment_date: appt?.starts_at ?? null,
        }
      }),
    }
  } catch (error) {
    throw parseBusinessError(error)
  }
})