// src/features/services/components/ServicesList.tsx
import { useState } from 'react';
import { Pencil, Plus, Power, PowerOff, Loader2, AlertCircle } from 'lucide-react';
import { useServices, useToggleServiceActive } from '../hooks';
import { ServiceFormModal } from './ServiceFormModal';
import type { ServiceItem } from '../types';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const ACCENT_COLORS = [
  { border: 'border-l-amber-500',  bg: 'bg-amber-500/10'  },
  { border: 'border-l-violet-500', bg: 'bg-violet-500/10' },
  { border: 'border-l-sky-500',    bg: 'bg-sky-500/10'    },
  { border: 'border-l-emerald-500',bg: 'bg-emerald-500/10'},
  { border: 'border-l-rose-500',   bg: 'bg-rose-500/10'   },
  { border: 'border-l-orange-500', bg: 'bg-orange-500/10' },
] as const;

export function ServicesList() {
  const { data, isLoading, isError, refetch } = useServices();
  const toggleActive = useToggleServiceActive();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(service: ServiceItem) {
    setEditing(service);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Serviços</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" />
          Novo
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-zinc-500">Erro ao carregar serviços.</p>
          <button
            onClick={() => refetch()}
            className="text-sm font-medium underline underline-offset-2"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && data && data.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-zinc-500">Nenhum serviço cadastrado.</p>
          <button
            onClick={openCreate}
            className="text-sm font-medium underline underline-offset-2"
          >
            Cadastrar o primeiro
          </button>
        </div>
      )}

      {/* List */}
      {!isLoading && !isError && data && data.length > 0 && (
        <ul className="space-y-3">
          {data.map((service, index) => {
            const accent = ACCENT_COLORS[index % ACCENT_COLORS.length]!;

            return (
              <li
                key={service.id}
                className={[
                  'flex items-center justify-between gap-4 rounded-xl border border-zinc-800 border-l-4 p-4 transition-colors',
                  accent.border,
                  service.isActive
                    ? 'bg-zinc-900 hover:border-zinc-700'
                    : 'opacity-60',
                ].join(' ')}
              >
                {/* Info */}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-white">
                      {service.name}
                    </span>
                    {!service.isActive && (
                      <span className="shrink-0 rounded-md bg-zinc-700 px-2 py-0.5 text-xs font-medium text-zinc-400">
                        Inativo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400">
                    {service.category ? `${service.category} · ` : ''}
                    {service.durationMinutes} min
                    <span className="mx-1.5 text-zinc-600">·</span>
                    <span className="font-medium text-zinc-300">
                      {currency.format(service.price)}
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => openEdit(service)}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() =>
                      toggleActive.mutate({
                        id: service.id,
                        isActive: !service.isActive,
                      })
                    }
                    disabled={toggleActive.isPending}
                    className={[
                      'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50',
                      service.isActive
                        ? 'border-red-900/60 text-red-400 hover:border-red-700 hover:text-red-300'
                        : 'border-green-900/60 text-green-500 hover:border-green-700 hover:text-green-400',
                    ].join(' ')}
                    title={service.isActive ? 'Desativar' : 'Reativar'}
                  >
                    {service.isActive ? (
                      <>
                        <PowerOff className="h-3.5 w-3.5" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Power className="h-3.5 w-3.5" />
                        Reativar
                      </>
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ServiceFormModal
        open={modalOpen}
        service={editing}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}