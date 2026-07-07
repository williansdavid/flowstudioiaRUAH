import { createFileRoute, redirect } from '@tanstack/react-router';
import { getSession } from '@/server/auth/getSession';
import { canAccessAdmin } from '@/features/auth/types';
import { LoginSplitLayout } from '@/features/auth/components/login/LoginSplitLayout';

export const Route = createFileRoute('/_auth/login')({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) return;
    if (canAccessAdmin(session.profile.role)) {
      throw redirect({ to: '/admin' });
    }
    if (session.profile.role === 'client') {
      throw redirect({ to: '/cliente' });
    }
  },
  component: LoginSplitLayout,
});