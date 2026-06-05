import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { signIn, type SignInInput } from '@/server/auth/signIn';
import { signOut } from '@/server/auth/signOut';
import {
  requestPasswordReset,
  type RequestPasswordResetInput,
} from '@/server/auth/requestPasswordReset';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { sessionQueryOptions, authKeys } from './queries';

export function useSession() {
  return useQuery(sessionQueryOptions());
}

export function useSignIn() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: SignInInput) => signIn({ data: input }),
    onSuccess: async (session) => {
      queryClient.setQueryData(authKeys.session, session);
      await queryClient.invalidateQueries({ queryKey: authKeys.session });
      await router.navigate({ to: '/admin' });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível entrar.');
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => signOut(),
    onSuccess: async () => {
      queryClient.setQueryData(authKeys.session, null);
      await router.navigate({ to: '/login' });
    },
    onError: () => {
      toast.error('Erro ao sair. Tente novamente.');
    },
  });
}

/**
 * Etapa 1 do reset: dispara e-mail com link de redefinição (server fn).
 * Resposta uniforme — não revela se o e-mail existe.
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (input: RequestPasswordResetInput) =>
      requestPasswordReset({ data: input }),
    onError: () => {
      toast.error('Não foi possível enviar o e-mail. Tente novamente.');
    },
  });
}

/**
 * Etapa 2 do reset: define a nova senha (client direto).
 *
 * A sessão temporária de recovery já existe no browser — criada pelo
 * @supabase/ssr ao detectar o token no hash da URL do link.
 * Por isso updateUser roda client-side, não em server fn.
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (password: string) => {
      const supabase = getSupabaseBrowser();

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);

      toast.success('Senha atualizada com sucesso. Faça login.');

      // signOut em background — não bloqueia nem aborta o fluxo.
      // Falha aqui é irrelevante: o hard redirect zera a sessão de qualquer forma.
      void supabase.auth.signOut().catch(() => {});

      // Hard redirect: garante navegação + reset total de sessão/estado,
      // imune à remontagem da árvore pelo @supabase/ssr ao rotacionar cookies.
      window.location.assign('/login');
    },
    onError: () => {
      toast.error('Link inválido ou expirado. Solicite um novo.');
    },
  });
}
