// src/routes/_authed/admin/agenda.tsx

import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { format, subDays, addDays, parseISO } from 'date-fns'  // ← adicionado subDays, addDays, parseISO
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as Calendarcon, Plus } from 'lucide-react'
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
      queryClient.ensureQueryData({
        queryKey: ['appointments', 'day', date],
        queryFn: () => getDayAppointments({ data: { date } }),
      }),
      queryClient.ensureQueryData({
        queryKey: ['staff', 'bookable'],
        queryFn: listBookableStaff,
      }),
      queryClient.ensureQueryData({
        queryKey: ['dayTimeOff', date],
        queryFn: () => getDayTimeOff({ data: { date } }),
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

function AgendaPage() {
  const today = todayLocalDate()
  const [date, setDate] = useState(today)
  const [modal, setModal] = useState<ModalState>({ open: false, mode: { kind: 'create' } })
  const { setContent: setTopbarContent } = useTopbarSlot()

  const { data: appointments } = useSuspenseQuery({
    queryKey: ['appointments', 'day', date],
    queryFn: () => getDayAppointments({ data: { date } }),
  })

  const { data: staff } = useSuspenseQuery({
    queryKey: ['staff', 'bookable'],
    queryFn: listBookableStaff,
  })

  const { data: timeOff = [] } = useSuspenseQuery({
    queryKey: ['dayTimeOff', date],
    queryFn: () => getDayTimeOff({ data: { date } }),
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

  // Injeta o cabeçalho compacto no slot do Topbar em mobile
  useEffect(() => {
    setTopbarContent(
      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-100">
        <Calendarcon className="h-4 w-4 text-cyan-400" />
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

  // ─── CORRIGIDO: date-fns em vez de new Date(string) — Safari-safe ───
  const handlePrevDay = () => {
    setDate(format(subDays(parseISO(date), 1), 'yyyy-MM-dd'))
  }

  const handleNextDay = () => {
    setDate(format(addDays(parseISO(date), 1), 'yyyy-MM-dd'))
  }
  // ─────────────────────────────────────────────────────────────────────

  const handleToday = () => setDate(today)

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) setDate(e.target.value)
  }

  const renderControls = (isMobile: boolean) => (
    <div className="flex items-center gap-1.5">
      {/* Navegação dias */}
      <div className="flex items-center rounded-lg border border-slate-700/40 bg-slate-800/60">
        <button
          onClick={handlePrevDay}
          className="flex h-9 w-9 items-center justify-center text-slate-400 transition-colors hover:text-slate-200 active:scale-95"
          aria-label="Dia anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          onClick={handleToday}
          className="flex h-9 items-center justify-center px-2 text-[11px] font-bold uppercase tracking-wider text-cyan-400 transition-colors hover:text-cyan-300 active:scale-95"
        >
          Hoje
        </button>

        <button
          onClick={handleNextDay}
          className="flex h-9 w-9 items-center justify-center text-slate-400 transition-colors hover:text-slate-200 active:scale-95"
          aria-label="Próximo dia"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Seletor de data nativo */}
      <div className="relative">
        <Calendarcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="h-9 w-0 appearance-none overflow-hidden rounded-lg border border-slate-700/40 bg-slate-800/60 pl-8 pr-3 text-sm font-medium text-slate-200 opacity-0 transition-all focus:w-44 focus:opacity-100 sm:w-44 sm:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
      </div>

      {/* Botão Novo agendamento */}
      <Button
        onClick={() => setModal({ open: true, mode: { kind: 'create' } })}
        className="flex-shrink-0 gap-1.5 px-3 py-2.5 h-auto text-xs sm:text-sm sm:h-10 sm:px-4 active:scale-95"
      >
        <Plus className="h-4 w-4" />
        Novo
      </Button>
    </div>
  )

  const dateHeader = format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <div className="flex h-full flex-col">
      {/* Header Fixo — escondido em mobile (vai pro slot do Topbar) */}
      <div className="hidden sm:flex items-center justify-between border-b border-slate-800/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-100">Agenda</h1>
          {isToday && (
            <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Hoje
            </span>
          )}
          <span className="text-sm font-medium text-slate-400">{dateHeader}</span>
        </div>
        {renderControls(false)}
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-auto">
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

      {/* Controles Mobile */}
      <div className="flex sm:hidden border-t border-slate-800/60 px-4 py-3">
        {renderControls(true)}
      </div>

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