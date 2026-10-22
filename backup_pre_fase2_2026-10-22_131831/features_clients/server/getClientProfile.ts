// src/features/clients/server/getClientProfile.ts
'use server'

import { createServerFn } from '@tanstack/react-start'
import { createSupabaseServer } from '@/lib/supabase/server'
import { parseBusinessError } from '@/lib/errors/parseBusinessError'
import { z } from 'zod'

const InputSchema = z.object({
  clientId: z.string().uuid(),
})

export const getClientProfile = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data: { clientId } }) => {
    const supabase = createSupabaseServer()

    // ─── 1. Buscar cliente da tabela clients ───
    // ✅ CORRIGIDO: clients_view → clients (colunas com nomes corretos)
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !clientData) {
      throw new Error('Cliente não encontrado')
    }

    // ✅ CORRIGIDO: clientData.name → clientData.full_name
    const client = {
      id: clientData.id,
      name: clientData.full_name,
      phone: clientData.phone,
      email: clientData.email,
      birth_date: clientData.birth_date,
      cpf: clientData.cpf,
      address: clientData.address,
      notes: clientData.notes,
      tags: clientData.tags,
      avatar_url: clientData.avatar_url,
      status: clientData.status,
      created_at: clientData.created_at,
      first_visit: clientData.first_visit,
      last_visit: clientData.last_visit,
      total_visits: clientData.total_visits,
      total_spent: clientData.total_spent,
      frequency_days: clientData.frequency_days,
    }

    // ─── Validação de integridade ───
    if (!client.name?.trim()) {
      throw new Error('Dados do cliente inconsistentes')
    }

    // ─── 2. Buscar appointments não-cancelados ───
    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select('id, service_id, staff_id, status, price')
      .eq('client_id', clientId)
      .neq('status', 'cancelled')

    if (apptError) {
      throw parseBusinessError('APPOINTMENTS_FETCH_FAILED', 'Erro ao buscar agendamentos')
    }

    const validAppointments = appointments ?? []

    // ─── 3. Financeiro ───
    const total_spent = clientData.total_spent ?? 0
    const total_visits = clientData.total_visits ?? 0
    const ticket_medio = total_visits > 0 ? total_spent / total_visits : 0
    const prices = validAppointments.map(a => a.price ?? 0)
    const biggest_purchase = prices.length > 0 ? Math.max(...prices) : null

    const financial = {
      total_spent,
      ticket_medio,
      total_visits,
      last_visit: clientData.last_visit,
      first_visit: clientData.first_visit,
      biggest_purchase,
      balance: null,
    }

    // ─── 4. Buscar nomes de serviços e profissionais ───
    const serviceIds = [...new Set(validAppointments.map(a => a.service_id))]
    const staffIds = [...new Set(validAppointments.map(a => a.staff_id))]

    const { data: services, error: servError } = await supabase
      .from('services')
      .select('id, name')
      .in('id', serviceIds)

    if (servError) {
      throw parseBusinessError('SERVICES_FETCH_FAILED', 'Erro ao buscar serviços')
    }

    // ✅ CORRIGIDO: staff.name → staff.full_name
    const { data: staffList, error: staffError } = await supabase
      .from('staff')
      .select('id, full_name')
      .in('id', staffIds)

    if (staffError) {
      throw parseBusinessError('STAFF_FETCH_FAILED', 'Erro ao buscar profissionais')
    }

    const serviceMap = new Map((services ?? []).map(s => [s.id, s.name]))
    // ✅ CORRIGIDO: s.name → s.full_name
    const staffMap = new Map((staffList ?? []).map(s => [s.id, s.full_name]))

    // ─── 5. Serviços favoritos (top 5) ───
    const serviceCounts: Record<string, { count: number; name: string }> = {}
    for (const app of validAppointments) {
      if (!app.service_id) continue
      if (!serviceCounts[app.service_id]) {
        serviceCounts[app.service_id] = { count: 0, name: '' }
      }
      serviceCounts[app.service_id]!.count++
      serviceCounts[app.service_id]!.name = serviceMap.get(app.service_id) ?? 'Serviço removido'
    }

    const favorite_services = Object.entries(serviceCounts)
      .map(([service_id, data]) => ({
        service_id,
        service_name: data.name ?? 'Serviço removido',
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // ─── 6. Profissionais preferidos ───
    const staffCounts: Record<string, { count: number; name: string }> = {}
    for (const app of validAppointments) {
      if (!app.staff_id) continue
      if (!staffCounts[app.staff_id]) {
        staffCounts[app.staff_id] = { count: 0, name: '' }
      }
      staffCounts[app.staff_id]!.count++
      staffCounts[app.staff_id]!.name = staffMap.get(app.staff_id) ?? 'Profissional removido'
    }

    const totalVisits = total_visits || 1

    const favorite_staff = Object.entries(staffCounts)
      .map(([staff_id, data]) => ({
        staff_id,
        staff_name: data.name ?? 'Profissional removido',
        count: data.count,
        percentage: Math.round((data.count / totalVisits) * 100),
      }))
      .sort((a, b) => b.count - a.count)

    // ─── 7. Frequência ───
    let frequency_days = clientData.frequency_days

    if (frequency_days === null && validAppointments.length >= 2) {
      const { data: dates, error: datesErr } = await supabase
        .from('appointments')
        .select('starts_at')
        .eq('client_id', clientId)
        .neq('status', 'cancelled')
        .order('starts_at', { ascending: true })

      if (!datesErr && dates && dates.length >= 2) {
        const diffMs = new Date(dates[dates.length - 1]!.starts_at).getTime() - new Date(dates[0]!.starts_at).getTime()
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
        frequency_days = Math.round(diffDays / (dates.length - 1))
      }
    }

    const last_visit = clientData.last_visit
    let next_visit_expected: string | null = null
    let is_overdue = false
    let days_since_last_visit: number | null = null
    let abandonment_risk: 'low' | 'medium' | 'high' = 'low'

    if (last_visit && frequency_days !== null) {
      const lastDate = new Date(last_visit)
      const today = new Date()
      const diffMs = today.getTime() - lastDate.getTime()
      days_since_last_visit = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const nextDate = new Date(lastDate.getTime() + frequency_days * 24 * 60 * 60 * 1000)
      next_visit_expected = nextDate.toISOString().split('T')[0] ?? null

      if (days_since_last_visit > frequency_days) {
        is_overdue = true
        if (days_since_last_visit > frequency_days * 2) {
          abandonment_risk = 'high'
        } else if (days_since_last_visit > frequency_days * 1.5) {
          abandonment_risk = 'medium'
        }
      }
    }

    const frequency_insights = {
      frequency_days,
      next_visit_expected,
      is_overdue,
      days_since_last_visit,
      abandonment_risk,
    }

    // ─── 8. Ranking ───
    // ✅ CORRIGIDO: clients_view → clients
    let position = 0
    let total_clients = 0
    let percentile = 0

    if (total_spent > 0) {
      const { count: rankCount, error: rankErr } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .gt('total_spent', total_spent)

      const { count: totalCount, error: totalErr } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })

      if (!rankErr && !totalErr) {
        position = (rankCount ?? 0) + 1
        total_clients = totalCount ?? 1
        percentile = Math.round((position / total_clients) * 100)
      }
    }

    const ranking = {
      position,
      total_clients,
      percentile,
    }

    // ─── 9. Indicadores ───
    const now = new Date().toISOString()

    const { count: futureCount, error: futureErr } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .gte('starts_at', now)
      .neq('status', 'cancelled')

    const has_future_appointment = !futureErr && (futureCount ?? 0) > 0
    const never_returned = total_visits <= 1 && !has_future_appointment

    const { count: cancelledCount, error: cancelledErr } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('status', 'cancelled')

    const cancelled_many = !cancelledErr && (cancelledCount ?? 0) >= 2
    const is_vip = total_spent > 1000 || total_visits >= 20

    let is_birthday_today = false
    if (clientData.birth_date) {
      const today = new Date()
      const birth = new Date(clientData.birth_date)
      if (birth.getMonth() === today.getMonth() && birth.getDate() === today.getDate()) {
        is_birthday_today = true
      }
    }

    const indicators = {
      has_future_appointment,
      never_returned,
      cancelled_many,
      is_vip,
      is_birthday_today,
    }

    return {
      client,
      financial,
      favorite_services,
      favorite_staff,
      frequency_insights,
      ranking,
      indicators,
    }
  })