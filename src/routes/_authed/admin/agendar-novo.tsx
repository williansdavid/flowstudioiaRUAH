// src/routes/_authed/admin/agendar-novo.tsx

import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { BookingWizard } from '@/features/appointments/components/BookingWizard/BookingWizard';
import {
  listClientsForSelect,
  listActiveServices,
  listBookableStaff,
  todayLocalDate,
} from '@/features/appointments';
import { businessHours } from '@/sites/ruah/config/businessHours';

export const Route = createFileRoute('/_authed/admin/agendar-novo')({
  staticData: { title: 'Novo Agendamento' },
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData({
        queryKey: ['appointments', 'clients'],
        queryFn: () => listClientsForSelect(),
      }),
      queryClient.ensureQueryData({
        queryKey: ['appointments', 'services'],
        queryFn: () => listActiveServices(),
      }),
      queryClient.ensureQueryData({
        queryKey: ['appointments', 'staff'],
        queryFn: () => listBookableStaff(),
      }),
    ]);
  },
  component: NovoAgendamentoPage,
});

function NovoAgendamentoPage() {
  const { data: clients } = useSuspenseQuery({
    queryKey: ['appointments', 'clients'],
    queryFn: () => listClientsForSelect(),
  });

  const { data: services } = useSuspenseQuery({
    queryKey: ['appointments', 'services'],
    queryFn: () => listActiveServices(),
  });

  const { data: staff } = useSuspenseQuery({
    queryKey: ['appointments', 'staff'],
    queryFn: () => listBookableStaff(),
  });

  return (
    <BookingWizard
      clients={clients}
      services={services}
      staff={staff}
      businessHours={businessHours}
    />
  );
}