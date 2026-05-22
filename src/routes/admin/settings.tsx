import { createFileRoute } from '@tanstack/react-router';
import { requirePermission } from '@/lib/auth/session';

export const Route = createFileRoute('/admin/settings')({
  beforeLoad: ({ context }) => {
    requirePermission(context.user, 'settings.manage');
  },
  component: SettingsRouteComponent,
});

function SettingsRouteComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-zinc-900">Configurações</h1>
      <p className="text-zinc-600 mt-2">
        Personalize as informações e a identidade do studio.
      </p>
    </div>
  );
}
