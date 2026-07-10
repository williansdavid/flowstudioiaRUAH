import { createFileRoute } from '@tanstack/react-router';
import { ReportsLayout } from '@/features/report';

export const Route = createFileRoute('/_authed/admin/relatorios')({
  staticData: { title: 'Relatórios' },
  component: ReportsLayout,
});