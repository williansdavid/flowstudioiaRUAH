import { useState } from 'react';
import { Pencil, Power, Scissors, SearchX } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  type DataTableColumn,
} from '@/components/ui';
import { useToggleServiceActive } from '../hooks';
import type { AdminServiceItem, ServiceFilters } from '../types';

interface ServiceListProps {
  services: AdminServiceItem[] | undefined;
  isLoading: boolean;
  error: Error | null;
  filters: ServiceFilters;
  onEdit: (service: AdminServiceItem) => void;
}

export function ServiceList({
  services,
  isLoading,
  error,
  filters,
  onEdit,
}: ServiceListProps) {
  const [toggleTarget, setToggleTarget] = useState<AdminServiceItem | null>(null);
  const toggleMutation = useToggleServiceActive();

  // ── Filtragem ──
  const filtered = (services ?? []).filter((s) => {
    if (filters.status === 'active' && !s.isActive) return false;
    if (filters.status === 'inactive' && s.isActive) return false;
    if (filters.category && s.category !== filters.category) return false;

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const hit =
        s.name.toLowerCase().includes(q) ||
        (s.description?.toLowerCase().includes(q) ?? false);
      if (!hit) return false;
    }
    return true;
  });

  const hasFilters =
    filters.search.trim() !== '' ||
    filters.status !== 'all' ||
    filters.category !== '';

  // ── Toggle confirm ──
  const handleToggleConfirm = async () => {
    if (!toggleTarget) return;
    await toggleMutation.mutateAsync({
      id: toggleTarget.id,
      isActive: !toggleTarget.isActive,
    });
    setToggleTarget(null);
  };

  // ── Colunas da tabela ──
  const columns: DataTableColumn<AdminServiceItem>[] = [
    {
      key: 'service',
      header: 'Serviço',
      cell: (s) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={s.imageUrl}
            fallbackIcon={Scissors}
            shape="square"
            size="md"
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-text-strong">{s.name}</p>
            {s.description && (
              <p className="truncate text-xs text-text-subtle">{s.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoria',
      cell: (s) => <span className="text-text">{s.category ?? '—'}</span>,
    },
    {
      key: 'duration',
      header: 'Duração',
      cell: (s) => <span className="text-text">{formatDuration(s.durationMinutes)}</span>,
    },
    {
      key: 'price',
      header: 'Preço',
      cell: (s) => (
        <span className="font-medium text-text-strong">{formatPrice(s.price)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (s) => <StatusBadge active={s.isActive} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (s) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Editar serviço"
            onClick={() => onEdit(s)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={s.isActive ? 'Desativar serviço' : 'Reativar serviço'}
            onClick={() => setToggleTarget(s)}
          >
            <Power
              className={`h-4 w-4 ${
                s.isActive ? 'text-text-subtle' : 'text-feedback-success'
              }`}
            />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        error={error}
        rowKey={(s) => s.id}
        isRowInactive={(s) => !s.isActive}
        loadingLabel="Carregando serviços..."
        errorLabel="Erro ao carregar serviços"
        emptyState={{
          icon: hasFilters ? SearchX : Scissors,
          title: hasFilters ? 'Nenhum resultado' : 'Nenhum serviço cadastrado',
          description: hasFilters
            ? 'Ajuste os filtros para encontrar serviços.'
            : 'Adicione o primeiro serviço do studio para começar.',
        }}
        mobileCard={(s) => <ServiceMobileCard service={s} onEdit={onEdit} onToggle={setToggleTarget} />}
      />

      <ConfirmDialog
        open={toggleTarget !== null}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={toggleTarget?.isActive ? 'Desativar serviço?' : 'Reativar serviço?'}
        description={
          toggleTarget?.isActive
            ? `"${toggleTarget?.name}" não aparecerá mais na landing nem em novos agendamentos. Os dados são preservados.`
            : `"${toggleTarget?.name}" voltará a aparecer para os clientes.`
        }
        confirmLabel={toggleTarget?.isActive ? 'Desativar' : 'Reativar'}
        variant={toggleTarget?.isActive ? 'danger' : 'default'}
        loading={toggleMutation.isPending}
        onConfirm={handleToggleConfirm}
      />
    </>
  );
}

// ─────────────────────────────────────────────
// Card mobile (sub-componente)
// ─────────────────────────────────────────────

interface ServiceMobileCardProps {
  service: AdminServiceItem;
  onEdit: (s: AdminServiceItem) => void;
  onToggle: (s: AdminServiceItem) => void;
}

function ServiceMobileCard({ service: s, onEdit, onToggle }: ServiceMobileCardProps) {
  return (
    <div
      data-inactive={!s.isActive || undefined}
      className={`rounded-lg border border-border-subtle bg-bg-card p-4 shadow-raised ${
        !s.isActive ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar src={s.imageUrl} fallbackIcon={Scissors} shape="square" size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-text-strong">{s.name}</p>
          {s.description && (
            <p className="line-clamp-2 text-xs text-text-subtle">{s.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {s.category && <Badge variant="muted">{s.category}</Badge>}
            <StatusBadge active={s.isActive} />
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-text-subtle">
            <span>{formatDuration(s.durationMinutes)}</span>
            <span className="font-medium text-text-strong">{formatPrice(s.price)}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2 border-t border-border-subtle pt-3">
        <Button variant="ghost" size="sm" onClick={() => onEdit(s)}>
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onToggle(s)}>
          <Power className="h-4 w-4" />
          {s.isActive ? 'Desativar' : 'Reativar'}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-componentes locais
// ─────────────────────────────────────────────

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="success">Ativo</Badge>
  ) : (
    <Badge variant="danger">Inativo</Badge>
  );
}

// ─────────────────────────────────────────────
// Helpers de formatação
// ─────────────────────────────────────────────

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}
