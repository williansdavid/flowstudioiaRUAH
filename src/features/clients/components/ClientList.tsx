import { Pencil, SearchX, Users } from 'lucide-react';
import { Button, EmptyState, Spinner } from '@/components/ui';
import { ClientOriginBadge } from './ClientOriginBadge';
import type { AdminClientItem, ClientFilters } from '../types';

interface ClientListProps {
  clients: AdminClientItem[] | undefined;
  isLoading: boolean;
  error: Error | null;
  filters: ClientFilters;
  onEdit: (client: AdminClientItem) => void;
}

export function ClientList({
  clients,
  isLoading,
  error,
  filters,
  onEdit,
}: ClientListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" label="Carregando clientes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Erro ao carregar clientes: {error.message}
      </div>
    );
  }

  const filtered = (clients ?? []).filter((c) => {
    if (filters.origin !== 'all' && c.origin !== filters.origin) return false;

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const hit =
        c.displayName.toLowerCase().includes(q) ||
        (c.displayPhone?.toLowerCase().includes(q) ?? false) ||
        (c.displayEmail?.toLowerCase().includes(q) ?? false);
      if (!hit) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    const hasFilters =
      filters.search.trim() !== '' || filters.origin !== 'all';

    return (
      <EmptyState
        icon={hasFilters ? SearchX : Users}
        title={hasFilters ? 'Nenhum resultado' : 'Nenhum cliente cadastrado'}
        description={
          hasFilters
            ? 'Ajuste os filtros para encontrar clientes.'
            : 'Adicione o primeiro cliente do studio para começar.'
        }
      />
    );
  }

  return (
    <>
      {/* ── Desktop: tabela ── */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Origem</th>
                <th className="px-4 py-3">Última visita</th>
                <th className="px-4 py-3 text-right">Atendimentos</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ClientAvatar name={c.displayName} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-neutral-900">
                          {c.displayName}
                        </p>
                        {c.notes && (
                          <p className="truncate text-xs text-neutral-500">
                            {c.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    <ClientContact
                      phone={c.displayPhone}
                      email={c.displayEmail}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <ClientOriginBadge origin={c.origin} />
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {formatLastVisit(c.lastVisitAt)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-900">
                    {c.totalAppointments}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar cliente"
                        onClick={() => onEdit(c)}
                      >
                        <Pencil className="h-4 w-4" />
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
        {filtered.map((c) => (
          <div
            key={c.id}
            className="rounded-lg border border-neutral-200 bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <ClientAvatar name={c.displayName} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-medium text-neutral-900">
                    {c.displayName}
                  </p>
                  <ClientOriginBadge origin={c.origin} />
                </div>
                <div className="mt-1 space-y-0.5 text-xs text-neutral-600">
                  {c.displayPhone && <p>{c.displayPhone}</p>}
                  {c.displayEmail && (
                    <p className="truncate">{c.displayEmail}</p>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
                  <span>Última visita: {formatLastVisit(c.lastVisitAt)}</span>
                  <span>•</span>
                  <span>{c.totalAppointments} atend.</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-end border-t border-neutral-100 pt-3">
              <Button variant="ghost" size="sm" onClick={() => onEdit(c)}>
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ──────────────────────────────────────────────
// Sub-componentes locais
// ──────────────────────────────────────────────

function ClientAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-600">
      {initial}
    </div>
  );
}

function ClientContact({
  phone,
  email,
}: {
  phone: string | null;
  email: string | null;
}) {
  if (!phone && !email) {
    return <span className="text-neutral-400">—</span>;
  }
  return (
    <div className="space-y-0.5">
      {phone && <p>{phone}</p>}
      {email && (
        <p className="truncate text-xs text-neutral-500">{email}</p>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Helpers de formatação
// ──────────────────────────────────────────────

function formatLastVisit(iso: string | null): string {
  if (!iso) return 'Nunca';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

