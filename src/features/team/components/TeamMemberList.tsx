import { useState } from 'react';
import { Pencil, Power, UserX, Users } from 'lucide-react';
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Spinner,
} from '@/components/ui';
import { useToggleTeamMemberActive } from '../hooks';
import type { TeamFilters, TeamMember } from '../types';

interface TeamMemberListProps {
  members: TeamMember[] | undefined;
  isLoading: boolean;
  error: Error | null;
  filters: TeamFilters;
  onEdit: (member: TeamMember) => void;
}

export function TeamMemberList({
  members,
  isLoading,
  error,
  filters,
  onEdit,
}: TeamMemberListProps) {
  const [toggleTarget, setToggleTarget] = useState<TeamMember | null>(null);
  const toggleMutation = useToggleTeamMemberActive();

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" label="Carregando equipe..." />
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Erro ao carregar equipe: {error.message}
      </div>
    );
  }

  // ── Filtrar ──
  const filtered = (members ?? []).filter((m) => {
    if (filters.status === 'active' && !m.isActive) return false;
    if (filters.status === 'inactive' && m.isActive) return false;
    if (filters.role !== 'all' && m.role !== filters.role) return false;

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const hit =
        m.fullName?.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q);
      if (!hit) return false;
    }
    return true;
  });

  // ── Empty ──
  if (filtered.length === 0) {
    const hasFilters =
      filters.search.trim() !== '' ||
      filters.status !== 'all' ||
      filters.role !== 'all';

    return (
      <EmptyState
        icon={hasFilters ? UserX : Users}
        title={hasFilters ? 'Nenhum resultado' : 'Nenhum membro cadastrado'}
        description={
          hasFilters
            ? 'Ajuste os filtros para encontrar membros.'
            : 'Adicione o primeiro membro da equipe para começar.'
        }
      />
    );
  }

  const handleToggleConfirm = async () => {
    if (!toggleTarget) return;
    await toggleMutation.mutateAsync({
      profileId: toggleTarget.profileId,
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
                <th className="px-4 py-3">Membro</th>
                <th className="px-4 py-3">Função</th>
                <th className="px-4 py-3">Especialidade</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((m) => (
                <tr
                  key={m.profileId}
                  className="hover:bg-neutral-50"
                  data-inactive={!m.isActive}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar member={m} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-neutral-900">
                          {m.fullName ?? '(sem nome)'}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                          {m.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={m.role} />
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {m.specialty ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={m.isActive} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar membro"
                        onClick={() => onEdit(m)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={
                          m.isActive ? 'Desativar membro' : 'Reativar membro'
                        }
                        onClick={() => setToggleTarget(m)}
                      >
                        <Power
                          className={`h-4 w-4 ${
                            m.isActive ? 'text-neutral-600' : 'text-green-600'
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
        {filtered.map((m) => (
          <div
            key={m.profileId}
            className="rounded-lg border border-neutral-200 bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <Avatar member={m} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-neutral-900">
                  {m.fullName ?? '(sem nome)'}
                </p>
                <p className="truncate text-xs text-neutral-500">{m.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <RoleBadge role={m.role} />
                  <StatusBadge active={m.isActive} />
                </div>
                {m.specialty && (
                  <p className="mt-2 text-xs text-neutral-600">
                    {m.specialty}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2 border-t border-neutral-100 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(m)}
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setToggleTarget(m)}
              >
                <Power className="h-4 w-4" />
                {m.isActive ? 'Desativar' : 'Reativar'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Confirmação de toggle ── */}
      <ConfirmDialog
        open={toggleTarget !== null}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={
          toggleTarget?.isActive ? 'Desativar membro?' : 'Reativar membro?'
        }
        description={
          toggleTarget?.isActive
            ? `${toggleTarget?.fullName ?? toggleTarget?.email} não poderá mais fazer login. Os dados são preservados.`
            : `${toggleTarget?.fullName ?? toggleTarget?.email} voltará a ter acesso ao sistema.`
        }
        confirmLabel={toggleTarget?.isActive ? 'Desativar' : 'Reativar'}
        variant={toggleTarget?.isActive ? 'danger' : 'default'}
        loading={toggleMutation.isPending}
        onConfirm={handleToggleConfirm}
      />
    </>
  );
}

// ────────────────────────────────────────
// Sub-componentes locais
// ────────────────────────────────────────

function Avatar({ member }: { member: TeamMember }) {
  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt=""
        className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
      />
    );
  }
  const initials = (member.fullName ?? member.email)
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-700">
      {initials}
    </div>
  );
}

function RoleBadge({ role }: { role: 'admin' | 'staff' }) {
  return role === 'admin' ? (
    <Badge variant="info">Administrador</Badge>
  ) : (
    <Badge variant="muted">Profissional</Badge>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="success">Ativo</Badge>
  ) : (
    <Badge variant="danger">Inativo</Badge>
  );
}
