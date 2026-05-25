import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { requirePermission } from '@/lib/auth/session';
import { Button } from '@/components/ui';

import { useClients } from '@/features/clients/hooks';
import { clientsListQuery } from '@/features/clients/queries';
import { DEFAULT_CLIENT_FILTERS } from '@/features/clients/types';
import type {
  AdminClientItem,
  ClientFilters,
} from '@/features/clients/types';
import { ClientsFiltersBar } from '@/features/clients/components/ClientsFiltersBar';
import { ClientList } from '@/features/clients/components/ClientList';
import { ClientFormDialog } from '@/features/clients/components/ClientFormDialog';

export const Route = createFileRoute('/admin/clients')({
  beforeLoad: ({ context }) => {
    requirePermission(context.user, 'clients.view');
  },
  loader: ({ context }) => {
    // SSR prefetch — popula o cache antes do componente renderizar
    return context.queryClient.ensureQueryData(clientsListQuery());
  },
  component: ClientsRouteComponent,
});

function ClientsRouteComponent() {
  const { data, isLoading, error } = useClients();

  const [filters, setFilters] = useState<ClientFilters>(
    DEFAULT_CLIENT_FILTERS,
  );

  // Form dialog (criar/editar)
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] =
    useState<AdminClientItem | null>(null);

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (client: AdminClientItem) => {
    setEditingClient(client);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Clientes</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Cadastro e histórico dos clientes do studio.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <UserPlus className="h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      {/* ── Filtros ── */}
      <ClientsFiltersBar filters={filters} onChange={setFilters} />

      {/* ── Lista ── */}
      <ClientList
        clients={data}
        isLoading={isLoading}
        error={error}
        filters={filters}
        onEdit={handleOpenEdit}
      />

      {/* ── Form criar/editar ── */}
      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={editingClient}
      />
    </div>
  );
}
