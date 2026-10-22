// src/features/clients/server/getOwnClientProfile.ts
'use server'

import { createServerFn } from '@tanstack/react-start'
import { createSupabaseServer } from '@/lib/supabase/server'

export interface OwnProfileData {
  full_name: string
  phone: string | null
  email: string | null
  avatar_url: string | null
  first_visit: string | null
  last_visit: string | null
  total_visits: number
  status: string
  frequency_days: number | null
  member_since: string
}

export const getOwnClientProfile = createServerFn({ method: 'GET' }).handler(
  async (): Promise<OwnProfileData | null> => {
    const supabase = createSupabaseServer()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return null

    const { data: client, error } = await supabase
      .from('clients')
      .select('full_name, phone, email, avatar_url, first_visit, last_visit, total_visits, status, frequency_days, created_at')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (error || !client) return null

    return {
      full_name: client.full_name ?? 'Cliente',
      phone: client.phone,
      email: client.email,
      avatar_url: client.avatar_url,
      first_visit: client.first_visit,
      last_visit: client.last_visit,
      total_visits: client.total_visits ?? 0,
      status: client.status ?? 'active',
      frequency_days: client.frequency_days,
      member_since: client.created_at,
    }
  },
)