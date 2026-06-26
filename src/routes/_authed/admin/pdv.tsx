import { createFileRoute } from '@tanstack/react-router';
import { PdvPage } from '@/features/sales/components/PdvPage';

export const Route = createFileRoute('/_authed/admin/pdv')({
  component: PdvPage,
  validateSearch: (search: Record<string, unknown>) => ({
    appointmentId: search.appointmentId as string | undefined,
  }),
});
