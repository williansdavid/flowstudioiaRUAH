// src/features/clients/server/getClientAlerts.ts
'use server'
import { createServerFn } from '@tanstack/react-start'
import { createSupabaseServer } from '@/lib/supabase/server'
import { parseBusinessError } from '@/lib/errors/parseBusinessError'

export const getClientAlerts = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const supabase = createSupabaseServer()
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')

    const fortyFiveDaysAgo = new Date(now)
    fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45)

    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [birthdayToday, inactive45d, vip, newThisWeek, noReturn] = await Promise.all([
      supabase.from('clients').select('id, full_name, phone')
        .filter('birth_date', 'like', `%-${month}-${day}`)
        .throwOnError(),
      supabase.from('clients').select('id, full_name, phone, last_visit, total_spent')
        .lt('last_visit', fortyFiveDaysAgo.toISOString())
        .or('status.eq.active,total_visits.gt.0')
        .throwOnError(),
      supabase.from('clients').select('id, full_name, phone, total_spent')
        .or('total_spent.gt.1000,total_visits.gte.20')
        .eq('status', 'active')
        .throwOnError(),
      supabase.from('clients').select('id, full_name, phone')
        .gte('first_visit', sevenDaysAgo.toISOString())
        .throwOnError(),
      supabase.from('clients').select('id, full_name, phone, total_visits')
        .eq('total_visits', 1)
        .throwOnError(),
    ])

    function mapClient(c: { id: string; full_name: string | null; phone: string | null }) {
      return { id: c.id, name: c.full_name ?? null, phone: c.phone ?? null }
    }

    return {
      birthdayToday: { clients: (birthdayToday.data ?? []).map(mapClient), count: birthdayToday.data?.length ?? 0 },
      inactive45d: { clients: (inactive45d.data ?? []).map(mapClient), count: inactive45d.data?.length ?? 0 },
      vip: { clients: (vip.data ?? []).map(mapClient), count: vip.data?.length ?? 0 },
      newThisWeek: { clients: (newThisWeek.data ?? []).map(mapClient), count: newThisWeek.data?.length ?? 0 },
      noReturn: { clients: (noReturn.data ?? []).map(mapClient), count: noReturn.data?.length ?? 0 },
    }
  } catch (error) {
    throw parseBusinessError(error)
  }
})