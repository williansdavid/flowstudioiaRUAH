import { createFileRoute, redirect } from '@tanstack/react-router';
import { getSession } from '@/server/auth/getSession';
import { canAccessAdmin } from '@/features/auth/types';
import { ForgotPasswordLayout } from '@/features/auth/components/login/ForgotPasswordLayout';

export const Route = createFileRoute('/_auth/forgot-password')({
  beforeLoad: async () => {
    const session = await getSession();
    if (session && canAccessAdmin(session.profile.role)) {
      throw redirect({ to: '/admin' });
    }
  },
  component: ForgotPasswordLayout,
});
