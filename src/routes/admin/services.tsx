import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { requirePermission } from '@/lib/auth/session';
import { Button } from '@/components/ui';

import { useServices } from '@/features/services/hooks';
import { servicesListQuery } from '@/features/services/queries';
import { DEFAULT_SERVICE_FILTERS } from '@/features/services/types';
import type {
  AdminServiceItem,
  ServiceFilters,
} from '@/features/services/types';
import { ServicesFiltersBar } from '@/features/services/components/ServicesFiltersBar';
import { ServiceList } from '@/features/services/components/ServiceList';
import { ServiceFormDialog } from '@/features/services/components/ServiceFormDialog';

export const Route = createFileRoute('/admin/services')({
  beforeLoad: ({ context }) => {
    requirePermission(context.user, 'services.view');
  },
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(servicesListQuery());
  },
  component: ServicesRouteComponent,
});

function ServicesRouteComponent() {
  const { data, isLoading, error } = useServices();

  const [filters, setFilters] = useState<ServiceFilters>(
    DEFAULT_SERVICE_FILTERS,
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] =
    useState<AdminServiceItem | null>(null);

  // Categorias únicas (não-nulas) extraídas dos dados — pra alimentar o filtro.
  const categories = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set).sort();
  }, [data]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (service: AdminServiceItem) => {
    setEditingService(service);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Serviços</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Gerencie o catálogo de serviços do studio.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Novo serviço
        </Button>
      </div>

      {/* ── Filtros ── */}
      <ServicesFiltersBar
        filters={filters}
        onChange={setFilters}
        categories={categories}
      />

      {/* ── Lista ── */}
      <ServiceList
        services={data}
        isLoading={isLoading}
        error={error}
        filters={filters}
        onEdit={handleOpenEdit}
      />

      {/* ── Form criar/editar ── */}
      <ServiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        service={editingService}
      />
    </div>
  );
}
