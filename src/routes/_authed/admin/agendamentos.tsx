import { createFileRoute, useRouter } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { getTodayAppointments, AppointmentsList } from '@/features/appointments';
import { ErrorState } from '@/components/feedback';

const appointmentsQuery = {
  queryKey: ['appointments', 'today'] as const,
  queryFn: () => getTodayAppointments(),
};

export const Route = createFileRoute('/_authed/admin/agendamentos')({
  staticData: { title: 'Agendamentos' },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(appointmentsQuery);
  },
  component: AgendamentosPage,
  errorComponent: AgendamentosError,
});

function AgendamentosPage() {
  const { data } = useSuspenseQuery(appointmentsQuery);

  return (
    <div className="space-y-6">
      <h1 className="text-base font-semibold">Agendamentos de hoje</h1>
      <AppointmentsList items={data} />
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
        await queryClient.invalidateQueries({
          queryKey: appointmentsQuery.queryKey,
        });
        reset();
        await router.invalidate();
      }}
    />
  );
}
