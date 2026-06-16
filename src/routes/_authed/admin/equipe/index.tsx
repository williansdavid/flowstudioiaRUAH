// src/routes/_authed/admin/equipe/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { StaffList } from '@/features/staff';

export const Route = createFileRoute('/_authed/admin/equipe/')({
  component: EquipePage,
});

function EquipePage() {
  return (
    <div className="space-y-6 p-4">
      <header>
        <h1 className="text-xl font-semibold">Equipe</h1>
        <p className="text-sm text-muted-foreground">
          Profissionais do studio e suas grades de horário.
        </p>
      </header>
      <StaffList />
    </div>
  );
}
