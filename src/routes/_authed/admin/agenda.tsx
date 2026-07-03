// src/routes/_authed/admin/agenda.tsx
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react'
import { DayCalendar } from '@/features/appointments/components/DayCalendar/DayCalendar'
import { AppointmentFormModal } from '@/features/appointments/components/AppointmentFormModal'
import { Button } from '@/features/utils/ui/Button'
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
  | {
      open: true
      mode:
        | { kind: 'create'; defaults?: { staffId?: string; startsAt?: string } }
        | { kind: 'edit'; appointment: AppointmentItem }
    }

function AgendaPage() {
  const today = todayLocalDate()
  const [date, setDate] = useState(today)
  const [modal, setModal] = useState<ModalState>({
    open: false,
    mode: { kind: 'create' },
  })

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

  const handleAppointmentClick = (appointment: AppointmentItem) => {
    setModal({ open: true, mode: { kind: 'edit', appointment } })
  }

  const handleSlotClick = (staffId: string, startsAt: string) => {
    setModal({
      open: true,
      mode: { kind: 'create', defaults: { staffId, startsAt } },
    })
  }

  const handlePrevDay = () => {
    const prev = new Date(date)
    prev.setDate(prev.getDate() - 1)
    setDate(prev.toISOString().split('T')[0]!)
  }

  const handleNextDay = () => {
    const next = new Date(date)
    next.setDate(next.getDate() + 1)
    setDate(next.toISOString().split('T')[0]!)
  }

  const handleToday = () => setDate(today)

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) setDate(e.target.value)
  }

  const dateObj = new Date(date + 'T00:00:00')

  const renderControls = (isMobile: boolean) => (
    <div className={`flex items-center gap-2 ${isMobile ? 'w-full justify-between' : 'hidden sm:flex'}`}>
      <button
        onClick={handleToday}
        className="flex-shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-slate-100 active:scale-95"
      >
        Hoje
      </button>
      <div className="flex flex-1 sm:flex-none items-center justify-between overflow-hidden rounded-lg border border-slate-700 bg-slate-900 mx-1 sm:mx-0 min-w-0">
        <button
          onClick={handlePrevDay}
          className="flex-shrink-0 p-2.5 sm:p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100 active:bg-slate-800"
          aria-label="Dia anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="relative flex flex-1 sm:flex-none items-center justify-center border-x border-slate-700 px-1.5 sm:px-3 py-2.5 sm:py-2 min-w-0">
          <CalendarIcon className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-slate-200 truncate">
            {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>
        <button
          onClick={handleNextDay}
          className="flex-shrink-0 p-2.5 sm:p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100 active:bg-slate-800"
          aria-label="Próximo dia"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <Button
        onClick={() => setModal({ open: true, mode: { kind: 'create' } })}
        className="flex-shrink-0 gap-1.5 px-3 py-2.5 h-auto text-xs sm:text-sm sm:h-10 sm:px-4 active:scale-95"
      >
        <Plus className="h-4 w-4" />
        Novo
      </Button>
    </div>
  )

  return (
    <div className="h-full w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[1600px] flex-1 flex flex-col p-0 sm:p-6 lg:px-8 overflow-hidden sm:gap-6 min-h-0">
        {/* Header Fixo */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-3 sm:p-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <CalendarIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">Agenda</span>
                {isToday && (
                  <span className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                    Hoje
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 capitalize leading-none">
                {format(dateObj, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </h1>
            </div>
          </div>
          {renderControls(false)}
        </div>

        {/* Main Grid */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden sm:rounded-2xl">
          <DayCalendar
            date={date}
            appointments={appointments}
            staff={staff}
            timeOff={timeOff}
            isToday={isToday}
            onAppointmentClick={handleAppointmentClick}
            onSlotClick={handleSlotClick}
          />
        </div>

        {/* Controles Mobile */}
        <div className="flex-shrink-0 sm:hidden px-3 pb-4 pt-3 border-t border-slate-800/60 bg-slate-950">
          {renderControls(true)}
        </div>
      </div>

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