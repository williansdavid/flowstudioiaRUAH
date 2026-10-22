// src/features/clients/server/getClientInsights.ts
'use server'

import { createServerFn } from '@tanstack/react-start'
import { createSupabaseServer } from '@/lib/supabase/server'
import { parseBusinessError } from '@/lib/errors/parseBusinessError'
import { z } from 'zod'

const clientIdSchema = z.object({
  clientId: z.string().uuid(),
})

export const getClientInsights = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => clientIdSchema.parse(data))
  .handler(async ({ data: { clientId } }) => {
    try {
      const supabase = createSupabaseServer()

      // 1. Fetch client from clients_view
      const { data: clientData, error: clientError } = await supabase
        .from('clients_view')
        .select('*')
        .eq('id', clientId)
        .single()

      if (clientError || !clientData) {
        throw new Error('Client not found')
      }

      // 2. Fetch non-cancelled appointments for total spent
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('price')
        .eq('client_id', clientId)
        .neq('status', 'cancelled')

      if (appointmentsError) {
        throw new Error('Failed to fetch appointments')
      }

      const totalSpent = appointments?.reduce((sum, app) => sum + (app.price ?? 0), 0) ?? 0
      const visits = appointments?.length ?? 0

      // 3. lifetime_value
      const lifetime_value = totalSpent

      // 4. ticket_medio
      const ticket_medio = visits > 0 ? totalSpent / visits : 0

      // 5. frequency_days (from trigger, stored in clientData)
      const frequency_days = clientData.frequency_days ?? null

      // 6. time_as_client_days
      const firstVisit = clientData.first_visit ? new Date(clientData.first_visit) : null
      const today = new Date()
      const time_as_client_days = firstVisit
        ? Math.floor((today.getTime() - firstVisit.getTime()) / (1000 * 60 * 60 * 24))
        : 0

      // 7. abandonment_risk
      let abandonment_risk: 'low' | 'medium' | 'high' = 'low'
      const lastVisit = clientData.last_visit ? new Date(clientData.last_visit) : null
      if (lastVisit && frequency_days && frequency_days > 0) {
        const daysSince = Math.floor((today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
        if (daysSince > frequency_days * 2) {
          abandonment_risk = 'high'
        } else if (daysSince > frequency_days * 1.5) {
          abandonment_risk = 'medium'
        }
      }

      // 8. ranking
      const { count: totalClients, error: countError } = await supabase
        .from('clients_view')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        throw new Error('Failed to count clients')
      }

      const { count: clientsWithMoreSpent, error: moreSpentError } = await supabase
        .from('clients_view')
        .select('*', { count: 'exact', head: true })
        .gt('total_spent', totalSpent)

      if (moreSpentError) {
        throw new Error('Failed to compute ranking')
      }

      const position = (clientsWithMoreSpent ?? 0) + 1

      return {
        lifetime_value,
        ticket_medio,
        frequency_days,
        time_as_client_days,
        abandonment_risk,
        ranking: {
          position,
          total_clients: totalClients ?? 0,
        },
      }
    } catch (error) {
      throw parseBusinessError(error)
    }
  })