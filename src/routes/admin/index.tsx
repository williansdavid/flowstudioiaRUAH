import { createFileRoute } from '@tanstack/react-router';
import { requirePermission } from '@/lib/auth/session';

export const Route = createFileRoute('/admin/')({
  beforeLoad: ({ context }) => {
    requirePermission(context.user, 'dashboard.view');
  },
  component: DashboardRouteComponent,
});

function DashboardRouteComponent() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Visão geral do studio: agendamentos do dia, receita e indicadores.
      </p>
    </div>
  );
}
