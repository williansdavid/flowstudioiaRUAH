// src/routes/_authed/admin/agendamentos.tsx
import { useState } from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDayAppointments,
  listClientsForSelect,
  listActiveServices,
  listBookableStaff,
  todayLocalDate,
  AppointmentsList,
  AppointmentFormModal,
} from '@/features/appointments';
import { ErrorState } from '@/components/feedback';
import { Plus } from 'lucide-react';

function dayQuery(date: string) {
  return {
    queryKey: ['appointments', 'day', date] as const,
    queryFn: () => getDayAppointments({ data: { date } }),
  };
}

const clientsQuery = {
  queryKey: ['appointments', 'clients'] as const,
  queryFn: () => listClientsForSelect(),
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
      context.queryClient.ensureQueryData(clientsQuery),
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(staffQuery),
    ]);
  },
  component: AgendamentosPage,
  errorComponent: AgendamentosError,
});

function AgendamentosPage() {
  const date = todayLocalDate();
  const { data: appointments } = useSuspenseQuery(dayQuery(date));
  const { data: clients } = useSuspenseQuery(clientsQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: staff } = useSuspenseQuery(staffQuery);

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold">Agendamentos de hoje</h1>
<button
  type="button"
  onClick={() => setModalOpen(true)}
  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
>
  <Plus className="size-4" />
  Novo agendamento
</button>
      </div>

      <AppointmentsList items={appointments} />

      <AppointmentFormModal
        open={modalOpen}
        mode={{ kind: 'create' }}
        clients={clients}
        services={services}
        staff={staff}
        onClose={() => setModalOpen(false)}
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
