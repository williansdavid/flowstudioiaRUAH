import { createFileRoute } from '@tanstack/react-router';
import { FinancePage } from '@/features/finance';

export const Route = createFileRoute('/_authed/admin/financeiro')({
  staticData: { title: 'Financeiro' },
  component: FinancePage,
});
