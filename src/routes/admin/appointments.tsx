import { createFileRoute } from '@tanstack/react-router';
import { requirePermission } from '@/lib/auth/session';

export const Route = createFileRoute('/admin/appointments')({
  beforeLoad: ({ context }) => {
    requirePermission(context.user, 'appointments.view');
  },
  component: AppointmentsRouteComponent,
});

function AppointmentsRouteComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-zinc-900">Agendamentos</h1>
      <p className="text-zinc-600 mt-2">
        Visualize e gerencie a agenda do studio.
      </p>
    </div>
  );
}
