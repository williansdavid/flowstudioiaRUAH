// src/routes/_authed.tsx
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getSession } from '@/server/auth/getSession';
import { canAccessAdmin } from '@/features/auth/types';
import type { SessionData } from '@/features/auth/types';
import { systemThemeClass } from '@/lib/core/system';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async (): Promise<{ session: SessionData }> => {
    const session = await getSession();

    if (!session) {
      throw redirect({ to: '/login' });
    }
    if (!canAccessAdmin(session.profile.role)) {
      throw redirect({ to: '/login' });
    }

    return { session };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  return (
    <div className={systemThemeClass}>
      <Outlet />
    </div>
  );
}
