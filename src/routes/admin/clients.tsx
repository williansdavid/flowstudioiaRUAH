import { createFileRoute } from '@tanstack/react-router';
import { requirePermission } from '@/lib/auth/session';

export const Route = createFileRoute('/admin/clients')({
  beforeLoad: ({ context }) => {
    requirePermission(context.user, 'clients.view');
  },
  component: ClientsRouteComponent,
});

function ClientsRouteComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-zinc-900">Clientes</h1>
      <p className="text-zinc-600 mt-2">
        Cadastro e histórico dos clientes do studio.
      </p>
    </div>
  );
}
