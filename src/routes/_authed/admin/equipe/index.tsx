// src/routes/_authed/admin/equipe/index.tsx
import { useState } from 'react';
import { createFileRoute, useRouteContext } from '@tanstack/react-router';
import { StaffList, StaffFormModal, useStaffList } from '@/features/staff';

export const Route = createFileRoute('/_authed/admin/equipe/')({
  component: EquipePage,
});

function EquipePage() {
  const { session } = useRouteContext({ from: '/_authed' });
  const isAdmin = session.profile.role === 'admin';

  const { data } = useStaffList();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingStaff =
    editingId !== null
      ? (data?.find((s) => s.id === editingId) ?? null)
      : null;

  return (
    <div className="space-y-6 p-4">
      <header>
        <h1 className="text-xl font-semibold">Equipe</h1>
        <p className="text-sm text-muted-foreground">
          Profissionais do studio e suas grades de horário.
        </p>
      </header>

      <StaffList
        onCreate={isAdmin ? () => setCreateOpen(true) : undefined}
        onEdit={(id) => setEditingId(id)}
      />

      {/* Create — só admin */}
      {isAdmin && (
        <StaffFormModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          mode="create"
        />
      )}

      {/* Edit — gate fino por canEdit já feito no StaffCard */}
      <StaffFormModal
        open={editingStaff !== null}
        onClose={() => setEditingId(null)}
        mode="edit"
        staff={editingStaff}
      />
    </div>
  );
}
