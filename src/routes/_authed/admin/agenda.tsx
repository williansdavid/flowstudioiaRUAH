import { Component, useState, useEffect, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { format, subDays, addDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as Calendarcon, Plus, CalendarSearchIcon  } from 'lucide-react'
import { DayCalendar } from '@/features/appointments/components/DayCalendar/DayCalendar'
import { AppointmentFormModal } from '@/features/appointments/components/AppointmentFormModal'
import { Button } from '@/features/utils/ui/Button'
import { useTopbarSlot } from '@/features/admin-shell/contexts/topbar-slot'
import {
  getDayAppointments,
  getDayTimeOff,
  listBookableStaff,
  listClientsForSelect,
  listActiveServices,
  todayLocalDate,
} from '@/features/appointments'
import { businessHours } from '@/sites/ruah/config/businessHours'
import type { AppointmentItem } from '@/features/appointments'

// ═══ ERROR BOUNDARY DE CLASSE — captura QUALQUER erro de renderização ═══
// Único propósito: parar tudo e mostrar o erro real. Nunca propaga.
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary Agenda]', {
      name: error.name,
      message: error.message,
      cause: error.cause,
      componentStack: info.componentStack?.split('\n').slice(0, 8).join('\n'),
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const err = this.state.error
      const errCause =
        err.cause instanceof Error
          ? `${err.cause.name}: ${err.cause.message}`
          : err.cause
            ? String(err.cause)
            : '—'

      return (
        <div className="flex h-full items-center justify-center p-6">
          <div className="w-full max-w-lg rounded-xl border-2 border-red-500/40 bg-red-500/10 p-6">
            <div className="flex items-center gap-2 text-lg font-bold text-red-400">
              <span>🔍 Erro capturado — Agenda parou</span>
            </div>

            <div className="mt-4 space-y-1.5 font-mono text-sm leading-relaxed text-slate-300">
              <div className="grid grid-cols-[120px_1fr] gap-x-2 gap-y-1.5">
                <span className="text-slate-500">Erro:</span>
                <span className="font-semibold text-red-400">{err.name}</span>

                <span className="text-slate-500">Mensagem:</span>
                <span className="break-words">{err.message}</span>

                <span className="text-slate-500">Causa:</span>
                <span className="break-words text-slate-400">{errCause}</span>
              </div>

              {err.stack && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-400">
                    Stack trace
                  </summary>
                  <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-slate-950/60 p-4 text-xs text-slate-500">
                    {err.stack
                      .split('\n')
                      .slice(0, 16)
                      .map((l) => l.trim())
                      .join('\n')}
                    {err.stack.split('\n').length > 16 && '\n...'}
                  </pre>
                </details>
              )}
            </div>

            <p className="mt-4 text-xs text-slate-600">
              Diagnóstico temporário. Compartilhe esta tela com o desenvolvedor.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
// ═══ FIM ERROR BOUNDARY ═══

export const Route = createFileRoute('/_authed/admin/agenda')({
  staticData: { title: 'Agenda' },
  // ═══ errorComponent REMOVIDO — o ErrorBoundary dentro do componente captura antes ═══
  loader: async ({ context: { queryClient } }) => {
    const date = todayLocalDate()
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['appointments', 'day', date],
        queryFn: () => getDayAppointments({ data: { date } }),
      }).catch(() => {
        console.warn('[agenda] prefetch getDayAppointments falhou')
      }),
      queryClient.prefetchQuery({
        queryKey: ['dayTimeOff', date],
        queryFn: () => getDayTimeOff({ data: { date } }),
      }).catch(() => {
        console.warn('[agenda] prefetch getDayTimeOff falhou')
      }),
      queryClient.ensureQueryData({
        queryKey: ['staff', 'bookable'],
        queryFn: listBookableStaff,
      }),
      queryClient.ensureQueryData({
        queryKey: ['clients', 'select'],
        queryFn: () => listClientsForSelect({ data: { q: '' } }),
      }),
      queryClient.ensureQueryData({
        queryKey: ['services', 'active'],
        queryFn: listActiveServices,
      }),
    ])
  },
  component: () => (
    <ErrorBoundary>
      <AgendaPage />
    </ErrorBoundary>
  ),
})

type ModalState =
  | { open: false; mode: { kind: 'create' } }
  | { open: true; mode:
      | { kind: 'create'; defaults?: { staffId?: string; startsAt?: string } }
      | { kind: 'edit'; appointment: AppointmentItem }
  }

const SHORTCUT_DAYS = 7

function AgendaPage() {
  const today = todayLocalDate()
  const [date, setDate] = useState(today)
  const [modal, setModal] = useState<ModalState>({ open: false, mode: { kind: 'create' } })
  const { setContent: setTopbarContent } = useTopbarSlot()

  const {
    data: appointments = [],
    error: appointmentsError,
    isError: isAppointmentsError,
  } = useQuery({
    queryKey: ['appointments', 'day', date],
    queryFn: () => getDayAppointments({ data: { date } }),
    throwOnError: false,
    staleTime: 30_000,
  })

  const {
    data: staff = [],
    error: staffError,
    isError: isStaffError,
  } = useQuery({
    queryKey: ['staff', 'bookable'],
    queryFn: listBookableStaff,
    throwOnError: false,
    staleTime: 30_000,
  })

  const {
    data: timeOff = [],
    error: timeOffError,
    isError: isTimeOffError,
  } = useQuery({
    queryKey: ['dayTimeOff', date],
    queryFn: () => getDayTimeOff({ data: { date } }),
    throwOnError: false,
    staleTime: 30_000,
  })

  const {
    data: clients = [],
    error: clientsError,
    isError: isClientsError,
  } = useQuery({
    queryKey: ['clients', 'select'],
    queryFn: () => listClientsForSelect({ data: { q: '' } }),
    throwOnError: false,
    staleTime: 30_000,
  })

  const {
    data: services = [],
    error: servicesError,
    isError: isServicesError,
  } = useQuery({
    queryKey: ['services', 'active'],
    queryFn: listActiveServices,
    throwOnError: false,
    staleTime: 30_000,
  })

  const isToday = date === today

  const shortcutDays = useMemo(() => {
    const days: { label: string; dateStr: string; dateObj: Date }[] = []
    for (let i = 0; i < SHORTCUT_DAYS; i++) {
      const d = addDays(parseISO(today), i)
      const dateStr = format(d, 'yyyy-MM-dd')
      let label: string
      if (i === 0) {
        label = 'Hoje'
      } else if (i === 1) {
        label = 'Amanhã'
      } else {
        label = format(d, 'EEE d', { locale: ptBR })
      }
      days.push({ label, dateStr, dateObj: d })
    }
    return days
  }, [today])

  useEffect(() => {
    setTopbarContent(
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
        <span className="text-base font-bold text-slate-100">Agenda</span>
        <span className="ml-1 text-xs font-medium text-slate-400">
          {format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </span>
        <div className="relative">
          <CalendarSearchIcon className="gap-1.5 h-8 w-8 text-cyan-400 cursor-pointer" />
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>        
      </div>
    )
    return () => setTopbarContent(null)
  }, [date, isToday, setTopbarContent])

  const handleAppointmentClick = (appointment: AppointmentItem) => {
    setModal({ open: true, mode: { kind: 'edit', appointment } })
  }

  const handleSlotClick = (staffId: string, startsAt: string) => {
    setModal({ open: true, mode: { kind: 'create', defaults: { staffId, startsAt } } })
  }

  const handlePrevDay = () => {
    setDate(format(subDays(parseISO(date), 1), 'yyyy-MM-dd'))
  }

  const handleNextDay = () => {
    setDate(format(addDays(parseISO(date), 1), 'yyyy-MM-dd'))
  }

  const handleToday = () => setDate(today)

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) setDate(e.target.value)
  }

  const dateHeader = format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <div className="flex h-full flex-col">
      {/* BARRA DE ATALHOS DE DATA */}
      <div className="flex items-center gap-1.5 px-2 sm:px-2 py-0 border-b border-slate-800/40 overflow-x-auto scrollbar-none">
        {shortcutDays.map((day) => {
          const isSelected = date === day.dateStr
          const isWeekend = [0, 6].includes(day.dateObj.getDay())

          return (
            <button
              key={day.dateStr}
              onClick={() => setDate(day.dateStr)}
              className={`
                flex-shrink-1 px-2 py-1.5 rounded-lg text-xs font-semibold
                transition-all duration-150 active:scale-95
                ${isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                  : isWeekend
                    ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }
              `}
            >
              {day.label}
            </button>
          )
        })}
      </div>

      {/* CARDS DE DIAGNÓSTICO (se alguma query falhou) */}
      {isAppointmentsError || isTimeOffError || isStaffError || isClientsError || isServicesError ? (
        <div className="flex-1 overflow-auto">
          {isAppointmentsError && appointmentsError && (
            <div className="mx-3 my-4 rounded-xl border-2 border-amber-500/40 bg-amber-500/10 p-5 sm:mx-6">
              <div className="flex items-center gap-2 text-base font-bold text-amber-400">
                <span>🔍 Diagnóstico — getDayAppointments</span>
              </div>
              <div className="mt-4 space-y-1.5 font-mono text-sm leading-relaxed text-slate-300">
                <div className="grid grid-cols-[120px_1fr] gap-x-2 gap-y-1.5">
                  <span className="text-slate-500">Erro:</span>
                  <span className="font-semibold text-red-400">{appointmentsError.name}</span>
                  <span className="text-slate-500">Mensagem:</span>
                  <span className="break-words">{appointmentsError.message}</span>
                  <span className="text-slate-500">Causa:</span>
                  <span className="break-words text-slate-400">
                    {appointmentsError.cause instanceof Error
                      ? `${appointmentsError.cause.name}: ${appointmentsError.cause.message}`
                      : appointmentsError.cause
                        ? String(appointmentsError.cause)
                        : '—'}
                  </span>
                  <span className="text-slate-500">Data:</span>
                  <span className="text-cyan-300">{date}</span>
                  <span className="text-slate-500">Payload:</span>
                  <span className="text-cyan-300">{JSON.stringify({ date })}</span>
                </div>
              </div>
            </div>
          )}
          {isTimeOffError && timeOffError && (
            <div className="mx-3 my-4 rounded-xl border-2 border-amber-500/40 bg-amber-500/10 p-5 sm:mx-6">
              <div className="flex items-center gap-2 text-base font-bold text-amber-400">
                <span>🔍 Diagnóstico — getDayTimeOff</span>
              </div>
              ...mesmo padrão...
            </div>
          )}
          {isStaffError && staffError && (
            <div className="mx-3 my-4 rounded-xl border-2 border-amber-500/40 bg-amber-500/10 p-5 sm:mx-6">
              <div className="flex items-center gap-2 text-base font-bold text-amber-400">
                <span>🔍 Diagnóstico — listBookableStaff</span>
              </div>
              ...mesmo padrão...
            </div>
          )}
          {isClientsError && clientsError && (
            <div className="mx-3 my-4 rounded-xl border-2 border-amber-500/40 bg-amber-500/10 p-5 sm:mx-6">
              <div className="flex items-center gap-2 text-base font-bold text-amber-400">
                <span>🔍 Diagnóstico — listClientsForSelect</span>
              </div>
              ...mesmo padrão...
            </div>
          )}
          {isServicesError && servicesError && (
            <div className="mx-3 my-4 rounded-xl border-2 border-amber-500/40 bg-amber-500/10 p-5 sm:mx-6">
              <div className="flex items-center gap-2 text-base font-bold text-amber-400">
                <span>🔍 Diagnóstico — listActiveServices</span>
              </div>
              ...mesmo padrão...
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <DayCalendar
            date={date}
            staff={staff}
            appointments={appointments}
            timeOff={timeOff}
            isToday={isToday}
            onAppointmentClick={handleAppointmentClick}
            onSlotClick={handleSlotClick}
          />
        </div>
      )}

      <AppointmentFormModal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: { kind: 'create' } })}
        mode={modal.mode}
        staff={staff}
        clients={clients}
        services={services}
        timeOff={timeOff}
        businessHours={businessHours}
      />
    </div>
  )
}