import { Component, useState } from 'react';
import { createFileRoute, useRouter, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format, subDays, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/features/utils/ui/Button';
import {
  getDayAppointments,
  getDayTimeOff,
  listClientsForSelect,
  listActiveServices,
  listBookableStaff,
  todayLocalDate,
  AppointmentsList,
  AppointmentFormModal,
} from '@/features/appointments';
import { businessHours } from '@/sites/ruah/config/businessHours';
import type { AppointmentItem } from '@/features/appointments';

// ═══ ERROR BOUNDARY DE CLASSE — captura QUALQUER erro de renderização ═══
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
    console.error('[ErrorBoundary Agendamentos]', {
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
              <span>🔍 Erro capturado — Agendamentos parou</span>
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

type ModalState = {
  open: boolean;
  mode:
    | { kind: 'create' }
    | { kind: 'edit'; appointment: AppointmentItem };
};

function dayQuery(date: string) {
  return {
    queryKey: ['appointments', 'day', date] as const,
    queryFn: () => getDayAppointments({ data: { date } }),
  };
}

const clientsQuery = {
  queryKey: ['appointments', 'clients'] as const,
  queryFn: () => listClientsForSelect({ data: { q: '' } }),
};

const servicesQuery = {
  queryKey: ['appointments', 'services'] as const,
  queryFn: () => listActiveServices(),
};

const staffQuery = {
  queryKey: ['appointments', 'staff'] as const,
  queryFn: () => listBookableStaff(),
};

export const Route = createFileRoute('/_authed/admin/agendamentos')({
  staticData: { title: 'Agendamentos' },
  loader: async ({ context: { queryClient } }) => {
    const date = todayLocalDate();
    await Promise.all([
      // Queries de data: prefetch NÃO quebra se falhar
      queryClient.prefetchQuery(dayQuery(date)).catch(() => {
        console.warn('[agendamentos] prefetch getDayAppointments falhou')
      }),
      queryClient.prefetchQuery({
        queryKey: ['dayTimeOff', date],
        queryFn: () => getDayTimeOff({ data: { date } }),
      }).catch(() => {
        console.warn('[agendamentos] prefetch getDayTimeOff falhou')
      }),
      // Queries estáveis: ensure críticas
      queryClient.ensureQueryData({
        queryKey: ['appointments', 'clients'],
        queryFn: () => listClientsForSelect({ data: { q: '' } }),
      }),
      queryClient.ensureQueryData(servicesQuery),
      queryClient.ensureQueryData(staffQuery),
    ]);
  },
  component: () => (
    <ErrorBoundary>
      <AgendamentosPage />
    </ErrorBoundary>
  ),
})

// Card de diagnóstico inline
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

function AgendamentosPage() {
  const navigate = useNavigate();
  const today = todayLocalDate();
  const [date, setDate] = useState(today);
  const [modal, setModal] = useState<ModalState>({ open: false, mode: { kind: 'create' } });

  // ─── QUERY 1: Appointments (data) ───
  const {
    data: appointments = [],
    error: appointmentsError,
    isError: isAppointmentsError,
  } = useQuery({
    ...dayQuery(date),
    throwOnError: false,
    staleTime: 30_000,
  })

  // ─── QUERY 2: Clients (estável) ───
  const {
    data: clients = [],
    error: clientsError,
    isError: isClientsError,
  } = useQuery({
    ...clientsQuery,
    throwOnError: false,
    staleTime: 30_000,
  })

  // ─── QUERY 3: Services (estável) ───
  const {
    data: services = [],
    error: servicesError,
    isError: isServicesError,
  } = useQuery({
    ...servicesQuery,
    throwOnError: false,
    staleTime: 30_000,
  })

  // ─── QUERY 4: Staff (estável) ───
  const {
    data: staff = [],
    error: staffError,
    isError: isStaffError,
  } = useQuery({
    ...staffQuery,
    throwOnError: false,
    staleTime: 30_000,
  })

  // ─── QUERY 5: TimeOff (data) ───
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

  const isToday = date === today;

  // ─── Navegação de data (Safari-safe com date-fns) ───
  const handlePrevDay = () => {
    setDate(format(subDays(parseISO(date), 1), 'yyyy-MM-dd'))
  }

  const handleNextDay = () => {
    setDate(format(addDays(parseISO(date), 1), 'yyyy-MM-dd'))
  }

  const handleToday = () => setDate(today);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) setDate(e.target.value);
  };

  const handleAppointmentClick = (appointment: AppointmentItem) => {
    setModal({ open: true, mode: { kind: 'edit', appointment } });
  };

  const renderControls = (isMobile: boolean) => (
    <div className="flex items-center gap-1.5">
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

      <div className="relative">
        <CalendarIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="h-9 w-0 appearance-none overflow-hidden rounded-lg border border-slate-700/40 bg-slate-800/60 pl-8 pr-3 text-sm font-medium text-slate-200 opacity-0 transition-all focus:w-44 focus:opacity-100 sm:w-44 sm:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
      </div>

      <Button
        onClick={() => navigate({ to: '/admin/agendar-novo' })}
        variant="primary"
        size="sm"
        className="gap-1.5"
      >
        <Plus className="h-4 w-4" />
        Novo
      </Button>
    </div>
  );

  // ─── Se alguma query falhou, mostra diagnóstico ───
  if (isAppointmentsError || isClientsError || isServicesError || isStaffError || isTimeOffError) {
    return (
      <div className="flex h-full flex-col p-6">
        <h1 className="text-xl font-bold text-slate-100 mb-4">Agendamentos</h1>
        <div className="flex-1 overflow-auto">
          {isAppointmentsError && appointmentsError && (
            <DiagnosticCard error={appointmentsError} date={date} queryName="getDayAppointments" />
          )}
          {isTimeOffError && timeOffError && (
            <DiagnosticCard error={timeOffError} date={date} queryName="getDayTimeOff" />
          )}
          {isStaffError && staffError && (
            <DiagnosticCard error={staffError} date={date} queryName="listBookableStaff" />
          )}
          {isClientsError && clientsError && (
            <DiagnosticCard error={clientsError} date={date} queryName="listClientsForSelect" />
          )}
          {isServicesError && servicesError && (
            <DiagnosticCard error={servicesError} date={date} queryName="listActiveServices" />
          )}
        </div>
      </div>
    )
  }

  // ═══ Renderização normal ═══
  const dateHeader = format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <div className="flex h-full flex-col gap-5 p-6">

      {/* Header desktop */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-100">Agendamentos</h1>
          {isToday && (
            <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Hoje
            </span>
          )}
          <span className="text-sm font-medium text-slate-400">
            {dateHeader}
          </span>
        </div>
        {renderControls(false)}
      </div>

      {/* Lista */}
      <div className="flex-1">
        <AppointmentsList
          items={appointments}
          onEdit={handleAppointmentClick}
          onNewAppointment={() => navigate({ to: '/admin/agendar-novo' })}
        />
      </div>

      {/* Rodapé mobile */}
      <div className="flex sm:hidden border-t border-slate-800/60 pt-4">
        {renderControls(true)}
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
  );
}