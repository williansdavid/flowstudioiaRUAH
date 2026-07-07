import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { CalendarPlus, CalendarCheck, Clock, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getClientAppointments } from '@/features/appointments/server/getClientAppointments'

export const Route = createFileRoute('/_client/cliente/')({
  component: ClientDashboardPage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData({
      queryKey: ['client', 'appointments'],
      queryFn: () => getClientAppointments(),
    })
  },
})

function ClientDashboardPage() {
  const { data } = useSuspenseQuery({
    queryKey: ['client', 'appointments'],
    queryFn: () => getClientAppointments(),
  })

  const now = new Date()
  const appointments = data.items ?? []

  const upcoming = appointments.filter(
    (a) => new Date(a.starts_at) > now && a.status !== 'cancelled',
  )

  const past = appointments
    .filter((a) => new Date(a.starts_at) <= now || a.status === 'cancelled')
    .slice(0, 5)

  return (
    <div className="space-y-6 py-4">
      {/* ─── Hero + CTA ─────────────────────────── */}
      <div className="rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
        <h1 className="text-xl font-bold text-slate-100 sm:text-2xl">
          O que vamos fazer hoje?
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Agende seu horário com alguns cliques.
        </p>
        <Link
          to="/cliente/agendar"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 active:scale-95"
        >
          <CalendarPlus className="h-4 w-4" />
          Novo Agendamento
        </Link>
      </div>

      {/* ─── Próximos agendamentos ──────────────── */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
          <CalendarCheck className="h-4 w-4 text-cyan-400" />
          Próximos agendamentos
        </h2>

        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700/50 p-6 text-center text-sm text-slate-500">
            Nenhum agendamento futuro.
            <br />
            <Link
              to="/cliente/agendar"
              className="mt-2 inline-block text-cyan-400 underline underline-offset-2 transition hover:text-cyan-300"
            >
              Agendar agora
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((appt) => {
              const date = new Date(appt.starts_at)
              const dayName = format(date, "EEEE", { locale: ptBR })
              const dayNumber = format(date, "d")
              const month = format(date, "MMM", { locale: ptBR })
              const time = format(date, "HH:mm")

              return (
                <div
                  key={appt.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-800/60 bg-slate-900/50 p-4 transition hover:border-slate-700"
                >
                  {/* Data compacta */}
                  <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-cyan-500/10 py-1.5 text-center">
                    <span className="text-[10px] font-medium uppercase text-cyan-400">
                      {month}
                    </span>
                    <span className="text-lg font-bold leading-tight text-slate-100">
                      {dayNumber}
                    </span>
                    <span className="text-[10px] capitalize text-slate-400">
                      {dayName.slice(0, 3)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">
                      {appt.service_name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {time}
                      </span>
                      {appt.staff_name && (
                        <span>Com {appt.staff_name}</span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
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
        )}
      </section>

      {/* ─── Últimos agendamentos ───────────────── */}
      {past.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Clock className="h-4 w-4 text-slate-500" />
            Últimos agendamentos
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
          <Link
            to="/cliente/agendamentos"
            className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-400 transition hover:text-cyan-300"
          >
            Ver histórico completo
            <ChevronRight className="h-3 w-3" />
          </Link>
        </section>
      )}
    </div>
  )
}