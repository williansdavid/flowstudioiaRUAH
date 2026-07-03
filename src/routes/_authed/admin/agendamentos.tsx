// src/routes/_authed/admin/agendamentos.tsx
import { useState } from 'react';
import { createFileRoute, useRouter, useNavigate } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
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
import { ErrorState } from '@/features/utils/feedback';
import { businessHours } from '@/sites/ruah/config/businessHours';
import type { AppointmentItem } from '@/features/appointments';

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
  loader: async ({ context }) => {
    const date = todayLocalDate();
    await Promise.all([
      context.queryClient.ensureQueryData(dayQuery(date)),
      context.queryClient.ensureQueryData({
        queryKey: ['appointments', 'clients'],
        queryFn: () => listClientsForSelect({ data: { q: '' } }),
      }),
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(staffQuery),
      context.queryClient.ensureQueryData({
        queryKey: ['dayTimeOff', date],
        queryFn: () => getDayTimeOff({ data: { date } }),
      }),
    ]);
  },
  component: AgendamentosPage,
  errorComponent: AgendamentosError,
});

function AgendamentosPage() {
  const navigate = useNavigate();
  const today = todayLocalDate();
  const [date, setDate] = useState(today);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    mode: { kind: 'create' },
  });

  const { data: appointments } = useSuspenseQuery(dayQuery(date));
  const { data: clients } = useSuspenseQuery(clientsQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: staff } = useSuspenseQuery(staffQuery);
  const { data: timeOff = [] } = useSuspenseQuery({
    queryKey: ['dayTimeOff', date],
    queryFn: () => getDayTimeOff({ data: { date } }),
  });

  const isToday = date === today;

  const handlePrevDay = () => {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 1);
    setDate(prev.toISOString().split('T')[0]!);
  };

  const handleNextDay = () => {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    setDate(next.toISOString().split('T')[0]!);
  };

  const handleToday = () => setDate(today);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) setDate(e.target.value);
  };

  const handleAppointmentClick = (appointment: AppointmentItem) => {
    setModal({ open: true, mode: { kind: 'edit', appointment } });
  };

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
      {/* ÚNICO botão Novo — navega pro wizard */}
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

  return (
    <div className="h-full w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[1600px] flex-1 flex flex-col p-0 sm:p-6 lg:px-8 overflow-hidden sm:gap-6 min-h-0">
        {/* Header desktop */}
        <div className="flex-shrink-0 hidden sm:flex items-center justify-between sm:p-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <CalendarIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">Agendamentos</span>
                {isToday && (
                  <span className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                    Hoje
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 leading-none">
                {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </h1>
            </div>
          </div>
          {renderControls(false)}
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-0">
          <AppointmentsList items={appointments} onEdit={handleAppointmentClick} />
        </div>

        {/* Rodapé mobile */}
        <div className="flex-shrink-0 sm:hidden px-3 pb-4 pt-3 border-t border-slate-800/60 bg-slate-950">
          {renderControls(true)}
        </div>
      </div>

      {/* Modal só pra EDIÇÃO (quando clica no lápis) */}
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

function AgendamentosError({ error, reset }: ErrorComponentProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  return (
    <ErrorState
      error={error}
      message="Não foi possível carregar os agendamentos. Tente novamente."
      onRetry={async () => {
        await queryClient.invalidateQueries({ queryKey: ['appointments'] });
        reset();
        await router.invalidate();
      }}
    />
  );
}