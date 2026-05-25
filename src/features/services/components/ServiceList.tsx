import { useState } from 'react';
import { Pencil, Power, Scissors, SearchX } from 'lucide-react';
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Spinner,
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
  const [toggleTarget, setToggleTarget] = useState<AdminServiceItem | null>(
    null,
  );
  const toggleMutation = useToggleServiceActive();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" label="Carregando serviços..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Erro ao carregar serviços: {error.message}
      </div>
    );
  }

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

  if (filtered.length === 0) {
    const hasFilters =
      filters.search.trim() !== '' ||
      filters.status !== 'all' ||
      filters.category !== '';

    return (
      <EmptyState
        icon={hasFilters ? SearchX : Scissors}
        title={hasFilters ? 'Nenhum resultado' : 'Nenhum serviço cadastrado'}
        description={
          hasFilters
            ? 'Ajuste os filtros para encontrar serviços.'
            : 'Adicione o primeiro serviço do studio para começar.'
        }
      />
    );
  }

  const handleToggleConfirm = async () => {
    if (!toggleTarget) return;
    await toggleMutation.mutateAsync({
      id: toggleTarget.id,
      isActive: !toggleTarget.isActive,
    });
    setToggleTarget(null);
  };

  return (
    <>
      {/* ── Desktop: tabela ── */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">
                <th className="px-4 py-3">Serviço</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Duração</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-neutral-50"
                  data-inactive={!s.isActive}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ServiceThumb service={s} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-neutral-900">
                          {s.name}
                        </p>
                        {s.description && (
                          <p className="truncate text-xs text-neutral-500">
                            {s.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {s.category ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {formatDuration(s.durationMinutes)}
                  </td>
                  <td className="px-4 py-3 text-neutral-900 font-medium">
                    {formatPrice(s.price)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={s.isActive} />
                  </td>
                  <td className="px-4 py-3">
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
                        aria-label={
                          s.isActive ? 'Desativar serviço' : 'Reativar serviço'
                        }
                        onClick={() => setToggleTarget(s)}
                      >
                        <Power
                          className={`h-4 w-4 ${
                            s.isActive ? 'text-neutral-600' : 'text-green-600'
                          }`}
                        />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile: cards ── */}
      <div className="grid gap-3 md:hidden">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="rounded-lg border border-neutral-200 bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <ServiceThumb service={s} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-neutral-900">
                  {s.name}
                </p>
                {s.description && (
                  <p className="line-clamp-2 text-xs text-neutral-500">
                    {s.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {s.category && (
                    <Badge variant="muted">{s.category}</Badge>
                  )}
                  <StatusBadge active={s.isActive} />
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-neutral-600">
                  <span>{formatDuration(s.durationMinutes)}</span>
                  <span className="font-medium text-neutral-900">
                    {formatPrice(s.price)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2 border-t border-neutral-100 pt-3">
              <Button variant="ghost" size="sm" onClick={() => onEdit(s)}>
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setToggleTarget(s)}
              >
                <Power className="h-4 w-4" />
                {s.isActive ? 'Desativar' : 'Reativar'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={toggleTarget !== null}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={
          toggleTarget?.isActive ? 'Desativar serviço?' : 'Reativar serviço?'
        }
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
// Sub-componentes locais
// ─────────────────────────────────────────────

function ServiceThumb({ service }: { service: AdminServiceItem }) {
  if (service.imageUrl) {
    return (
      <img
        src={service.imageUrl}
        alt=""
        className="h-10 w-10 flex-shrink-0 rounded-md object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-500">
      <Scissors className="h-4 w-4" />
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="success">Ativo</Badge>
  ) : (
    <Badge variant="danger">Inativo</Badge>
  );
}

// ─────────────────────────────────────────────
// Helpers de formatação (locais)
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
