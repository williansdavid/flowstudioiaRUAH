// src/routes/_authed/admin/equipe/index.tsx
import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { StaffList, StaffFormModal, useStaffList } from '@/features/staff';
import { useSession } from '@/features/auth';                           // <--- adicionar
import type { StaffListItem } from '@/features/staff/types';

export const Route = createFileRoute('/_authed/admin/equipe/')({
  component: EquipePage,
});

function EquipePage() {
  const session = useSession();                                          // <--- adicionar
  const isAdmin = session.data?.profile.role === 'admin';                // <--- adicionar
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: staffList } = useStaffList(false);

  const editingStaff: StaffListItem | null =
    editingId !== null && staffList
      ? (staffList.find((s) => s.id === editingId) ?? null)
      : null;

  return (
    <div className="h-full w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[1600px] flex-1 flex flex-col p-0 sm:p-6 lg:px-8 overflow-hidden sm:gap-6 min-h-0">
        <div className="flex-1 overflow-y-auto px-4 sm:px-0">
          <StaffList
            onCreate={isAdmin ? () => setCreateOpen(true) : undefined}   // <--- alterado
            onEdit={(id) => setEditingId(id)}
          />
        </div>
      </div>
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