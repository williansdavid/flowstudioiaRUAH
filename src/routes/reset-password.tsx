import { createFileRoute } from '@tanstack/react-router';
import { ResetPasswordLayout } from '@/features/auth/components/login/ResetPasswordLayout';

export const Route = createFileRoute('/reset-password')({
  // SEM guard de sessão: o usuário chega aqui com sessão de recovery
  // criada pelo token do hash da URL. Bloquear "autenticado" aqui
  // impediria justamente quem precisa redefinir.
  component: ResetPasswordLayout,
});
