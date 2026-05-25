import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { requirePermission } from '@/lib/auth/session';
import { Button } from '@/components/ui';

import { useTeamMembers } from '@/features/team/hooks';
import { teamListQuery } from '@/features/team/queries';
import { DEFAULT_TEAM_FILTERS } from '@/features/team/types';
import type {
  CreateStaffResult,
  TeamFilters,
  TeamMember,
} from '@/features/team/types';
import { TeamFiltersBar } from '@/features/team/components/TeamFiltersBar';
import { TeamMemberList } from '@/features/team/components/TeamMemberList';
import { TeamMemberFormDialog } from '@/features/team/components/TeamMemberFormDialog';
import { TeamTempPasswordDialog } from '@/features/team/components/TeamTempPasswordDialog';

export const Route = createFileRoute('/admin/staff')({
  beforeLoad: ({ context }) => {
    requirePermission(context.user, 'team.manage');
  },
  loader: ({ context }) => {
    // SSR prefetch — popula o cache antes do componente renderizar
    return context.queryClient.ensureQueryData(teamListQuery());
  },
  component: StaffRouteComponent,
});

function StaffRouteComponent() {
  const { data, isLoading, error } = useTeamMembers();

  const [filters, setFilters] = useState<TeamFilters>(DEFAULT_TEAM_FILTERS);

  // Form dialog (criar/editar)
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Temp password dialog (pós-criação)
  const [tempPasswordResult, setTempPasswordResult] =
    useState<CreateStaffResult | null>(null);

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormOpen(true);
  };

  const handleCreated = (result: CreateStaffResult) => {
    setTempPasswordResult(result);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Equipe</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Gerencie administradores e profissionais do studio.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <UserPlus className="h-4 w-4" />
          Novo membro
        </Button>
      </div>

      {/* ── Filtros ── */}
      <TeamFiltersBar filters={filters} onChange={setFilters} />

      {/* ── Lista ── */}
      <TeamMemberList
        members={data}
        isLoading={isLoading}
        error={error}
        filters={filters}
        onEdit={handleOpenEdit}
      />

      {/* ── Form criar/editar ── */}
      <TeamMemberFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        member={editingMember}
        onCreated={handleCreated}
      />

      {/* ── Senha temporária ── */}
      <TeamTempPasswordDialog
        open={tempPasswordResult !== null}
        onOpenChange={(open) => !open && setTempPasswordResult(null)}
        result={tempPasswordResult}
      />
    </div>
  );
}
