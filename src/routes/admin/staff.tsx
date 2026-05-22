import { createFileRoute } from '@tanstack/react-router';
import { requirePermission } from '@/lib/auth/session';

export const Route = createFileRoute('/admin/staff')({
  beforeLoad: ({ context }) => {
    requirePermission(context.user, 'team.manage');
  },
  component: StaffRouteComponent,
});

function StaffRouteComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-zinc-900">Equipe</h1>
      <p className="text-zinc-600 mt-2">
        Gerencie os profissionais do studio.
      </p>
    </div>
  );
}
