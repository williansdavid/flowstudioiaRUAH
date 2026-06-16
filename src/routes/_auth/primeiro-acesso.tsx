import { createFileRoute } from '@tanstack/react-router';
import { FirstAccessLayout } from '@/features/auth/components/login/FirstAccessLayout';

export const Route = createFileRoute('/_auth/primeiro-acesso')({
  // SEM guard de sessão: o profissional chega com sessão de invite
  // criada pelo @supabase/ssr ao detectar type=invite no hash da URL.
  component: FirstAccessLayout,
});
