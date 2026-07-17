// src/routes/_authed/admin/agendamentos.tsx

import { useState } from 'react';
import { createFileRoute, useRouter, useNavigate } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format, subDays, addDays, parseISO } from 'date-fns';         // ← adicionado subDays, addDays, parseISO
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
  const [modal, setModal] = useState<ModalState>({ open: false, mode: { kind: 'create' } });

  const { data: appointments } = useSuspenseQuery(dayQuery(date));
  const { data: clients } = useSuspenseQuery(clientsQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: staff } = useSuspenseQuery(staffQuery);
  const { data: timeOff = [] } = useSuspenseQuery({
    queryKey: ['dayTimeOff', date],
    queryFn: () => getDayTimeOff({ data: { date } }),
  });

  const isToday = date === today;

  // ─── CORRIGIDO: date-fns em vez de new Date(string) — Safari-safe ───
  const handlePrevDay = () => {
    setDate(format(subDays(parseISO(date), 1), 'yyyy-MM-dd'))
  }

  const handleNextDay = () => {
    setDate(format(addDays(parseISO(date), 1), 'yyyy-MM-dd'))
  }
  // ─────────────────────────────────────────────────────────────────────

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
            {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
            })}
          </span>
        </div>
        {renderControls(false)}
      </div>

      {/* Lista */}
      <div className="flex-1">
        <AppointmentsList
          items={appointments}
          onEdit={handleAppointmentClick}
        />
      </div>

      {/* Rodapé mobile */}
      <div className="flex sm:hidden border-t border-slate-800/60 pt-4">
        {renderControls(true)}
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
      message="Não foi possível carregar os agendamentos."
      onRetry={async () => {
        await queryClient.invalidateQueries({ queryKey: ['appointments'] });
        reset();
        await router.invalidate();
      }}
    />
  );
}