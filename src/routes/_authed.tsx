import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getSession } from '@/server/auth/getSession';
import { canAccessAdmin } from '@/features/auth/types';
import type { SessionData } from '@/features/auth/types';

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
  component: () => <Outlet />,
});
