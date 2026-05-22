import { createFileRoute } from '@tanstack/react-router';
import { requirePermission } from '@/lib/auth/session';

export const Route = createFileRoute('/admin/services')({
  beforeLoad: ({ context }) => {
    requirePermission(context.user, 'services.view');
  },
  component: ServicesRouteComponent,
});

function ServicesRouteComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-zinc-900">Serviços</h1>
      <p className="text-zinc-600 mt-2">
        Gerencie os serviços oferecidos pelo studio.
      </p>
    </div>
  );
}
