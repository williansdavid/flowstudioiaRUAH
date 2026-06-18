// src/routes/_authed/admin/agenda.tsx
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus } from 'lucide-react'
import { DayCalendar } from '@/features/appointments/components/DayCalendar/DayCalendar'
import { AppointmentFormModal } from '@/features/appointments/components/AppointmentFormModal'
import {
  getDayAppointments,
  listBookableStaff,
  listClientsForSelect,
  listActiveServices,
  todayLocalDate,
  useUpdateAppointment,
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
        queryKey: ['clients', 'select'],
        queryFn: listClientsForSelect,
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

  const queryClient = useQueryClient()

  const { data: appointments } = useSuspenseQuery({
    queryKey: ['appointments', 'day', date],
    queryFn: () => getDayAppointments({ data: { date } }),
  })

  const { data: staff } = useSuspenseQuery({
    queryKey: ['staff', 'bookable'],
    queryFn: listBookableStaff,
  })

  const { data: clients } = useSuspenseQuery({
    queryKey: ['clients', 'select'],
    queryFn: listClientsForSelect,
  })

  const { data: services } = useSuspenseQuery({
    queryKey: ['services', 'active'],
    queryFn: listActiveServices,
  })

  const isToday = date === today
  const { mutate: updateAppointment } = useUpdateAppointment()

  const handleAppointmentUpdate = (
    id: string,
    next: { staffId: string; startsAt: string; endsAt: string }
  ) => {
    updateAppointment(
      { id, staffId: next.staffId, startsAt: next.startsAt, endsAt: next.endsAt },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['appointments', 'day', date],
          })
          toast.success('Agendamento atualizado')
        },
      }
    )
  }

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

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  }

  const dateObj = new Date(date + 'T00:00:00')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">Agenda</h1>
              <p className="text-sm text-slate-400">
                {format(dateObj, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleToday}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-slate-100"
            >
              Hoje
            </button>

            <div className="flex items-center overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
              <button
                onClick={handlePrevDay}
                className="p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
                aria-label="Dia anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="relative flex items-center border-x border-slate-700 px-3 py-2">
                <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                <input
                  type="date"
                  value={date}
                  onChange={handleDateChange}
                  className="bg-transparent text-sm font-medium text-slate-200 outline-none"
                />
              </div>

              <button
                onClick={handleNextDay}
                className="p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
                aria-label="Próximo dia"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={() => {
                setModal({ open: true, mode: { kind: 'create' } })
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-900/20 transition hover:bg-cyan-500"
            >
              <Plus className="h-4 w-4" />
              Novo
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <DayCalendar
              date={date}
              appointments={appointments}
              staff={staff}
              isToday={isToday}
              onAppointmentClick={handleAppointmentClick}
              onAppointmentUpdate={handleAppointmentUpdate}
              onSlotClick={handleSlotClick}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <Clock className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-slate-100">Resumo do dia</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Total" value={stats.total} color="bg-slate-800" />
                <StatCard label="Confirmados" value={stats.confirmed} color="bg-emerald-500/10 text-emerald-300" />
                <StatCard label="Concluídos" value={stats.completed} color="bg-blue-500/10 text-blue-300" />
                <StatCard label="Cancelados" value={stats.cancelled} color="bg-red-500/10 text-red-300" />
              </div>
            </div>

            {/* Upcoming */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <h3 className="mb-4 font-semibold text-slate-100">Próximos agendamentos</h3>

              <div className="space-y-2">
                {appointments.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum agendamento para este dia.</p>
                ) : (
                  appointments
                    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
                    .slice(0, 5)
                    .map((appt) => (
                      <div
                        key={appt.id}
                        className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/50 p-3 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-200">{appt.clientName}</p>
                          <p className="truncate text-xs text-slate-500">{appt.serviceName}</p>
                        </div>
                        <div className="ml-3 text-right">
                          <p className="font-medium text-slate-300">
                            {format(new Date(appt.startsAt), 'HH:mm')}
                          </p>
                          <p className="text-[10px] uppercase text-slate-500">{appt.status}</p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AppointmentFormModal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: { kind: 'create' } })}
        mode={modal.mode}
        staff={staff}
        clients={clients}
        services={services}
        businessHours={businessHours}
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className={`rounded-lg border border-slate-800/60 p-3 ${color}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-medium opacity-70">{label}</p>
    </div>
  )
}