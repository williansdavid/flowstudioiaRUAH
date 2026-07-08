import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { CalendarPlus, CalendarCheck, Clock, ChevronRight, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getClientAppointments } from '@/features/appointments/server/getClientAppointments'
import { useSession } from '@/features/auth/hooks'
import { siteUrl } from '@/config/active-studio'


export const Route = createFileRoute('/_client/cliente/')({
  component: ClientDashboardPage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData({
      queryKey: ['client', 'appointments'],
      queryFn: () => getClientAppointments(),
    })
  },
})

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function ClientDashboardPage() {
  const { data: session } = useSession()
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

  const nextAppointment = upcoming.length > 0 ? upcoming[0] : null
  const greeting = getGreeting()
  const displayName = session?.profile?.full_name ?? 'Cliente'
  const firstName = displayName.split(' ')[0]

  return (
    <div className="space-y-6 py-4">
      {/* ─── Saudação + CTA ──────────────────────── */}
      <div className="rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-100 sm:text-2xl">
              {greeting}, {firstName}!
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Pronto para o próximo corte? Agende agora.
            </p>
          </div>
          <Link
            to="/cliente/agendar"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 active:scale-95"
          >
            <CalendarPlus className="h-4 w-4" />
            Agendar
          </Link>
        </div>
      </div>

      {/* ─── Grid: Próximo horário + Indique ──────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Card: Próximo horário */}
        <div className="rounded-xl border border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-950 p-5">
          {nextAppointment ? (
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <CalendarCheck className="h-4 w-4 text-cyan-400" />
                Próximo horário
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-cyan-500/10 py-2 text-center">
                  <span className="text-[10px] font-medium uppercase text-cyan-400">
                    {format(new Date(nextAppointment.starts_at), 'MMM', { locale: ptBR })}
                  </span>
                  <span className="text-xl font-bold leading-tight text-slate-100">
                    {format(new Date(nextAppointment.starts_at), 'd')}
                  </span>
                  <span className="text-[10px] capitalize text-slate-400">
                    {format(new Date(nextAppointment.starts_at), 'EEE', { locale: ptBR }).slice(0, 3)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-slate-100">
                    {nextAppointment.service_name}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(nextAppointment.starts_at), 'HH:mm')}
                    </span>
                    {nextAppointment.staff_name && (
                      <span>Com {nextAppointment.staff_name}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      nextAppointment.status === 'confirmed'
                        ? 'bg-green-500/10 text-green-400'
                        : nextAppointment.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {nextAppointment.status === 'confirmed'
                      ? 'Confirmado'
                      : nextAppointment.status === 'pending'
                        ? 'Pendente'
                        : nextAppointment.status}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <CalendarCheck className="mx-auto h-8 w-8 text-slate-600" />
              <p className="mt-2 text-sm font-medium text-slate-300">
                Nenhum horário agendado
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Clique em "Agendar" e marque seu próximo horário.
              </p>
            </div>
          )}
        </div>

        {/* Card: Indique um amigo */}
        <div className="rounded-xl border border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-950 p-5">
<a
  href={`https://wa.me/?text=${encodeURIComponent(
    `Conheça a Ruah Barber Lounge! http://www.ruahbarbearia.com.br/`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-400 underline underline-offset-2 hover:text-blue-300"
>
  <Share2 className=" flex-center h-5 w-5" />
  Compartilhe com um amigo
</a>
        </div>
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
              const dayName = format(date, 'EEEE', { locale: ptBR })
              const dayNumber = format(date, 'd')
              const month = format(date, 'MMM', { locale: ptBR })
              const time = format(date, 'HH:mm')
              return (
                <div
                  key={appt.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-800/60 bg-slate-900/50 p-4 transition hover:border-slate-700"
                >
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
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">
                      {appt.service_name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {time}
                      </span>
                      {appt.staff_name && <span>Com {appt.staff_name}</span>}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
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
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
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