// src/routes/_client/cliente/agendamentos.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { CalendarCheck, Clock, ChevronLeft, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getClientAppointments } from '@/features/appointments/server/getClientAppointments'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_client/cliente/agendamentos')({
  component: ClientAppointmentsPage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData({
      queryKey: ['client', 'appointments'],
      queryFn: () => getClientAppointments(),
    })
  },
})

function ClientAppointmentsPage() {
  const { data, isLoading } = useSuspenseQuery({
    queryKey: ['client', 'appointments'],
    queryFn: () => getClientAppointments(),
  })

  const appointments = data?.items ?? []

  const now = new Date()

  const upcoming = appointments.filter(
    (a) => new Date(a.starts_at) > now && a.status !== 'cancelled',
  )

  const past = appointments.filter(
    (a) => new Date(a.starts_at) <= now || a.status === 'cancelled',
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/cliente"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-2"
          >
            <ChevronLeft className="h-3 w-3" />
            Voltar
          </Link>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-cyan-400" />
            Meus agendamentos
          </h1>
        </div>
      </div>

      {/* Empty state */}
      {appointments.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700/50 p-10 text-center text-sm text-slate-500">
          <CalendarCheck className="mx-auto mb-3 h-8 w-8 text-slate-600" />
          Nenhum agendamento encontrado.
          <br />
          <Link
            to="/cliente/agendar"
            className="mt-3 inline-block text-cyan-400 underline underline-offset-2 transition hover:text-cyan-300"
          >
            Agendar agora
          </Link>
        </div>
      )}

      {/* Próximos */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Próximos
          </h2>
          <div className="space-y-3">
            {upcoming.map((appt) => {
              const date = new Date(appt.starts_at)
              return (
                <div
                  key={appt.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-800/60 bg-slate-900/50 p-4"
                >
                  <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-cyan-500/10 py-1.5 text-center">
                    <span className="text-[10px] font-medium uppercase text-cyan-400">
                      {format(date, 'MMM', { locale: ptBR })}
                    </span>
                    <span className="text-lg font-bold leading-tight text-slate-100">
                      {format(date, 'd')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">
                      {appt.service_name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(date, "HH:mm")}
                      </span>
                      {appt.staff_name && <span>Com {appt.staff_name}</span>}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium
                      ${
                        appt.status === 'confirmed'
                          ? 'bg-green-500/10 text-green-400'
                          : appt.status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-slate-800 text-slate-400'
                      }`}
                  >
                    {appt.status === 'confirmed'
                      ? 'Confirmado'
                      : appt.status === 'pending'
                        ? 'Pendente'
                        : appt.status}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Histórico */}
      {past.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Clock className="h-4 w-4 text-slate-500" />
            Histórico
          </h2>
          <div className="space-y-2">
            {past.map((appt) => {
              const date = new Date(appt.starts_at)
              return (
                <div
                  key={appt.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800/40 bg-slate-900/30 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-slate-200">
                      {appt.service_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(date, "d 'de' MMMM, HH:mm", { locale: ptBR })}
                      {appt.staff_name && ` · ${appt.staff_name}`}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium
                      ${
                        appt.status === 'completed'
                          ? 'bg-green-500/10 text-green-400'
                          : appt.status === 'cancelled'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-slate-800 text-slate-400'
                      }`}
                  >
                    {appt.status === 'completed'
                      ? 'Concluído'
                      : appt.status === 'cancelled'
                        ? 'Cancelado'
                        : appt.status}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}