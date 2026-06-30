// src/features/clients/server/getClientKpis.ts
'use server'
import { createServerFn } from '@tanstack/react-start'
import { createSupabaseServer } from '@/lib/supabase/server'
import { parseBusinessError } from '@/lib/errors/parseBusinessError'

export interface ClientKpisResponse {
  active_count: number
  new_this_month: number
  avg_return_days: number | null
  avg_ticket: number | null
}

export const getClientKpis = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const supabase = createSupabaseServer()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [activeResult, newMonthResult, frequencyResult, ticketResult] = await Promise.all([
      supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth),
      supabase
        .from('clients')
        .select('frequency_days')
        .not('frequency_days', 'is', null)
        .gte('frequency_days', 1),
      supabase
        .from('clients')
        .select('total_spent, total_visits')
        .gt('total_visits', 0),
    ])

    const freqData = frequencyResult.data ?? []
    const avgReturnDays =
      freqData.length > 0
        ? Math.round(
            freqData.reduce((sum, c) => sum + (c.frequency_days ?? 0), 0) / freqData.length,
          )
        : null

    const ticketData = ticketResult.data ?? []
    const avgTicket =
      ticketData.length > 0
        ? Math.round(
            ticketData.reduce((sum, c) => sum + (c.total_spent ?? 0), 0) /
              ticketData.reduce((sum, c) => sum + (c.total_visits ?? 0), 0),
          )
        : null

    return {
      active_count: activeResult.count ?? 0,
      new_this_month: newMonthResult.count ?? 0,
      avg_return_days: avgReturnDays,
      avg_ticket: avgTicket,
    }
  } catch (error) {
    throw parseBusinessError(error)
  }
})