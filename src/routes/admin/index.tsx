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
    <div className="p-6">
      <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
      <p className="text-zinc-600 mt-2">
        Visão geral do studio: agendamentos do dia, receita e indicadores.
      </p>
    </div>
  );
}
