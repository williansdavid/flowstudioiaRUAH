import { createFileRoute } from '@tanstack/react-router';
import { requireRole } from '@/lib/auth/session';
import { AdminLayout } from '@/components/layout/AdminLayout';

export const Route = createFileRoute('/admin')({
  beforeLoad: ({ context }) => {
    requireRole(context.user, ['admin', 'staff']);
  },
  component: AdminRouteComponent,
});

function AdminRouteComponent() {
  const { user } = Route.useRouteContext();

  // Após requireRole, user é garantido não-nulo
  if (!user) return null;

  return <AdminLayout user={user} />;
}
