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
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Configurações</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Personalize as informações e a identidade do studio.
      </p>
    </div>
  );
}
