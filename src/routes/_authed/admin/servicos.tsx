import { createFileRoute } from '@tanstack/react-router';
import { ServicesList } from '@/features/services';

export const Route = createFileRoute('/_authed/admin/servicos')({
  staticData: { title: 'Serviços' },
  component: ServicesList,
});
