import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/features/admin-shell';

export const Route = createFileRoute('/_authed/admin')({
  component: AdminShell,
});

function AdminShell() {
  const { session } = Route.useRouteContext();

  // VITE_STUDIO_NAME existe em produção; fallback defensivo p/ dev.
  const studioName = import.meta.env.VITE_STUDIO_NAME ?? 'FlowStudio';

  return <AdminLayout session={session} studioName={studioName} />;
}
