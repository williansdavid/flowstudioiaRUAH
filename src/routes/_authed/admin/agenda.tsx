// src/routes/_authed/admin/agenda.tsx
import { useState, useEffect, useMemo } from 'react'  // ← add useMemo
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery ,useQuery} from '@tanstack/react-query'
import { format, subDays, addDays, parseISO, isSameDay } from 'date-fns'  // ← add isSameDay
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as Calendarcon, Plus , CalendarSearch } from 'lucide-react'
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

export const Route = createFileRoute('/_authed/admin/agenda')({
  staticData: { title: 'Agenda' },
  loader: async ({ context: { queryClient } }) => {
    const date = todayLocalDate()
    await Promise.all([
      // ─── Queries de data: tentam pré-carregar, mas NÃO quebram se falharem ───
      queryClient.prefetchQuery({
        queryKey: ['appointments', 'day', date],
        queryFn: () => getDayAppointments({ data: { date } }),
      }).catch(() => {
        console.warn('[agenda] prefetch getDayAppointments falhou — componente exibirá erro.')
      }),
      queryClient.prefetchQuery({
        queryKey: ['dayTimeOff', date],
        queryFn: () => getDayTimeOff({ data: { date } }),
      }).catch(() => {
        console.warn('[agenda] prefetch getDayTimeOff falhou — componente exibirá erro.')
      }),
      // ─── Queries estáveis: continuam como ensure (críticas e SEMPRE funcionam) ───
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
  component: AgendaPage,
})

type ModalState =
  | { open: false; mode: { kind: 'create' } }
  | { open: true; mode:
      | { kind: 'create'; defaults?: { staffId?: string; startsAt?: string } }
      | { kind: 'edit'; appointment: AppointmentItem }
  }

// ─── Número de dias no atalho ───
const SHORTCUT_DAYS = 7

/** Card de diagnóstico para exibir inline (sem depender de ErrorBoundary) */
function DiagnosticCard({
  error,
  date,
  queryName,
}: {
   error: Error | null 
  date: string
  queryName: string
}) {
  if (!error) return null 
  const errCause =
    error.cause instanceof Error
      ? `${error.cause.name}: ${error.cause.message}`
      : error.cause
        ? String(error.cause)
        : '—'

  return (
    <div className="mx-3 my-4 rounded-xl border-2 border-amber-500/40 bg-amber-500/10 p-5 sm:mx-6">
      <div className="flex items-center gap-2 text-base font-bold text-amber-400">
        <span>🔍 Diagnóstico — {queryName}</span>
      </div>

      <div className="mt-4 space-y-1.5 font-mono text-sm leading-relaxed text-slate-300">
        <div className="grid grid-cols-[120px_1fr] gap-x-2 gap-y-1.5">
          <span className="text-slate-500">Erro:</span>
          <span className="font-semibold text-red-400">{error.name}</span>

          <span className="text-slate-500">Mensagem:</span>
          <span className="break-words">{error.message}</span>

          <span className="text-slate-500">Causa:</span>
          <span className="break-words text-slate-400">{errCause}</span>

          <span className="text-slate-500">Data:</span>
          <span className="text-cyan-300">{date}</span>

          <span className="text-slate-500">Payload:</span>
          <span className="text-cyan-300">{JSON.stringify({ date })}</span>
        </div>

        {error.stack && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-400">
              Stack trace
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-950/60 p-3 text-xs text-slate-500">
              {error.stack
                .split('\n')
                .slice(0, 8)
                .map((l) => l.trim())
                .join('\n')}
              {error.stack.split('\n').length > 8 && '\n...'}
            </pre>
          </details>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-600">
        Diagnóstico temporário — erro ao carregar dados para a data {date}.
        Compartilhe esta tela com o desenvolvedor.
      </p>
    </div>
  )
}

function AgendaPage() {
  const today = todayLocalDate()
  const [date, setDate] = useState(today)
  const [modal, setModal] = useState<ModalState>({ open: false, mode: { kind: 'create' } })
  const { setContent: setTopbarContent } = useTopbarSlot()

const {
  data: appointments=[],
  error: appointmentsError,
  isError: isAppointmentsError,
} = useQuery({
  queryKey: ['appointments', 'day', date],
  queryFn: () => getDayAppointments({ data: { date } }),
  throwOnError: false,
  staleTime: 30_000,
})

  const { data: staff } = useSuspenseQuery({
    queryKey: ['staff', 'bookable'],
    queryFn: listBookableStaff,
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

  const { data: clients } = useSuspenseQuery({
    queryKey: ['clients', 'select'],
    queryFn: () => listClientsForSelect({ data: { q: '' } }),
  })

  const { data: services } = useSuspenseQuery({
    queryKey: ['services', 'active'],
    queryFn: listActiveServices,
  })

  const isToday = date === today

  // ─── Gera os dias do atalho: Hoje + próximos N dias ───
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
        // Nome do dia abreviado + dia do mês
        label = format(d, 'EEE d', { locale: ptBR })
      }
      days.push({ label, dateStr, dateObj: d })
    }
    return days
  }, [today])

  // Injeta o cabeçalho compacto no slot do Topbar em mobile
  useEffect(() => {
    setTopbarContent(
      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-100">
        {/* Ícone clicável — abre seletor de data */}
        <div className="relative">
          <Calendarcon className="h-4 w-4 text-cyan-400 cursor-pointer" />
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>

        <span>Agenda</span>
        {isToday && (
          <span className="ml-1 rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            Hoje
          </span>
        )}
        <span className="ml-1 text-xs font-medium text-slate-400">
          {format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </span>
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
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 px-4 sm:px-6 py-0 sm:py-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-slate-100 shrink-0"> Agenda</h1>
          {isToday && (
            <span className="rounded-full bg-cyan-500/15 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-cyan-400 shrink-0">
              Hoje
            </span>
          )}
        {/* Ícone clicável — abre seletor de data */}
        <div className="relative">
          <CalendarSearch className="h-8 w-8 text-cyan-400 cursor-pointer" />
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
          <span className="hidden sm:block text-sm font-medium text-slate-400 truncate">
            {dateHeader}
          </span>
        </div>
      </div>

      {/* ═══ BARRA DE ATALHOS DE DATA ═══  */}
      <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 border-b border-slate-800/40 overflow-x-auto scrollbar-none">
        {shortcutDays.map((day) => {
          const isSelected = date === day.dateStr
          const isWeekend = [0, 6].includes(day.dateObj.getDay())

          return (
            <button
              key={day.dateStr}
              onClick={() => setDate(day.dateStr)}
              className={`
                flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold
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

      {/* DayCalendar */}
{/* Se alguma query de data falhou, mostra diagnóstico */}
{isAppointmentsError || isTimeOffError ? (
  <div className="flex-1 overflow-auto">
    {isAppointmentsError && appointmentsError && (
      <DiagnosticCard
        error={appointmentsError}
        date={date}
        queryName="getDayAppointments"
      />
    )}
    {isTimeOffError && timeOffError && (
      <DiagnosticCard
        error={timeOffError}
        date={date}
        queryName="getDayTimeOff"
      />
    )}
  </div>
) : (
  /* DayCalendar funciona normalmente */
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

      {/* Modal de criação/edição */}
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