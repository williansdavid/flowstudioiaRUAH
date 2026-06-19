// src/routes/_authed/admin/equipe/index.tsx
import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { StaffList, StaffFormModal, useStaffList } from '@/features/staff';
import type { StaffListItem } from '@/features/staff/types';

export const Route = createFileRoute('/_authed/admin/equipe/')({
  component: EquipePage,
});

function EquipePage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Busca dados só para resolver o staff que está sendo editado
  const { data: staffList } = useStaffList(false);

  const editingStaff: StaffListItem | null =
    editingId !== null && staffList
      ? (staffList.find((s) => s.id === editingId) ?? null)
      : null;

  return (
    <div className="space-y-6 p-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Equipe</h1>
          <p className="text-sm text-text-muted">
            Profissionais do studio e suas grades de horário.
          </p>
        </div>
      </header>

      <StaffList
        onCreate={() => setCreateOpen(true)}
        onEdit={(id) => setEditingId(id)}
      />

      {createOpen && (
        <StaffFormModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          mode="create"
        />
      )}

      <StaffFormModal
        open={editingStaff !== null}
        onClose={() => setEditingId(null)}
        mode="edit"
        staff={editingStaff}
      />
    </div>
  );
}