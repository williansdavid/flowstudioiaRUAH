import { createFileRoute } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { useSignOut } from '@/features/auth/hooks';

export const Route = createFileRoute('/_authed/admin/')({
  component: AdminHome,
});

function AdminHome() {
  const { session } = Route.useRouteContext();
  const signOut = useSignOut();

  return (
    <main className="min-h-screen bg-[var(--color-background)] p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)]">
              Painel
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              {session.profile.full_name ?? session.email} · {session.profile.role}
            </p>
          </div>
          <button
            onClick={() => signOut.mutate()}
            disabled={signOut.isPending}
            className="flex items-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
        <p className="text-[var(--color-text-muted)]">
          Guard funcionando. Dashboard real chega na Sprint 2.
        </p>
      </div>
    </main>
  );
}
