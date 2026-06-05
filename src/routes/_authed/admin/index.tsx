import { createFileRoute } from '@tanstack/react-router';
import { LayoutDashboard } from 'lucide-react';

export const Route = createFileRoute('/_authed/admin/')({
  staticData: { title: 'Dashboard' },
  component: AdminHome,
});


function AdminHome() {
  const { session } = Route.useRouteContext();
  const displayName = session.profile.full_name ?? session.email;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-6 w-6 text-[var(--color-primary)]" />
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-heading)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Bem-vindo, {displayName} · {session.profile.role}
          </p>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <p className="text-[var(--color-text-muted)]">
          Shell ativo. Métricas reais chegam quando montarmos o dashboard.
        </p>
      </div>
    </div>
  );
}
