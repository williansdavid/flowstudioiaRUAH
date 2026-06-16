// src/features/staff/components/StaffList.tsx
import { useState } from 'react';
import { Link, useRouteContext } from '@tanstack/react-router';
import {
  AlertCircle,
  CalendarClock,
  Clock,
  Pencil,
  Plus,
  UserCog,
} from 'lucide-react';
import { useStaffList } from '../hooks';
import { StaffFormModal } from './StaffFormModal';
import type { StaffListItem } from '../types';

export function StaffList() {
  const { session } = useRouteContext({ from: '/_authed' });
  const isAdmin = session.profile.role === 'admin';

  const { data, isLoading, isError, error, refetch } = useStaffList();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<StaffListItem | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Equipe</h2>
        {isAdmin ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-text-on-dark hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Novo profissional
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Falha ao carregar equipe.'}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            Tentar novamente
          </button>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
          <UserCog className="h-7 w-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum profissional cadastrado.
          </p>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-text-on-dark hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Cadastrar profissional
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((s) => (
            <div
              key={s.id}
              className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{s.name}</h3>
                  <span
                    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.isBookable
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <CalendarClock className="h-3 w-3" />
                    {s.isBookable ? 'Agendável' : 'Não agendável'}
                  </span>
                </div>
                {s.specialty ? (
                  <p className="text-sm text-muted-foreground">{s.specialty}</p>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/admin/equipe/$staffId/horarios"
                  params={{ staffId: s.id }}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
                >
                  <Clock className="h-4 w-4" />
                  Horários
                </Link>
                {s.canEdit ? (
                  <button
                    type="button"
                    onClick={() => setEditing(s)}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
                    aria-label={`Editar ${s.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create — só admin */}
      {isAdmin ? (
        <StaffFormModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          mode="create"
        />
      ) : null}

      {/* Edit — gate por canEdit do item (admin ou dono) */}
      <StaffFormModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        mode="edit"
        staff={editing}
      />
    </div>
  );
}
