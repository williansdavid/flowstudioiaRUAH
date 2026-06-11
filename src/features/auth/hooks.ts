import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { signIn, type SignInInput } from '@/server/auth/signIn';
import { signOut } from '@/server/auth/signOut';
import {
  requestPasswordReset,
  type RequestPasswordResetInput,
} from '@/server/auth/requestPasswordReset';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { sessionQueryOptions } from './queries';

export function useSession() {
  return useQuery(sessionQueryOptions());
}

export function useSignIn() {
  return useMutation({
    mutationFn: (input: SignInInput) => signIn({ data: input }),
    onSuccess: () => {
      // Hard redirect reexecuta os loaders SSR com a sessao nova e recarrega
      // a pagina inteira -> o cache do React Query morre junto com o JS.
      // NAO chamar queryClient.clear() aqui: limpar o cache antes da navegacao
      // efetivar derruba isBusy de imediato e pisca estado de erro/vazio na
      // arvore ainda montada (flash de erro no overlay antes de entrar).
      window.location.assign('/admin');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Nao foi possivel entrar.');
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => {
      // Fronteira de sessao: derruba todo o cache do usuario que esta saindo.
      queryClient.clear();
      // Hard redirect: remonta a arvore limpa, sem estado residual.
      window.location.assign('/login');
    },
    onError: () => {
      toast.error('Erro ao sair. Tente novamente.');
    },
  });
}

/**
 * Etapa 1 do reset: dispara e-mail com link de redefinicao (server fn).
 * Resposta uniforme — nao revela se o e-mail existe.
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (input: RequestPasswordResetInput) =>
      requestPasswordReset({ data: input }),
    onError: () => {
      toast.error('Nao foi possivel enviar o e-mail. Tente novamente.');
    },
  });
}

/**
 * Etapa 2 do reset: define a nova senha (client direto).
 *
 * A sessao temporaria de recovery ja existe no browser — criada pelo
 * @supabase/ssr ao detectar o token no hash da URL do link.
 * Por isso updateUser roda client-side, nao em server fn.
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (password: string) => {
      const supabase = getSupabaseBrowser();

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);

      toast.success('Senha atualizada com sucesso. Faca login.');

      // signOut em background — nao bloqueia nem aborta o fluxo.
      // Falha aqui e irrelevante: o hard redirect zera a sessao de qualquer forma.
      void supabase.auth.signOut().catch(() => {});

      // Hard redirect: garante navegacao + reset total de sessao/estado,
      // imune a remontagem da arvore pelo @supabase/ssr ao rotacionar cookies.
      window.location.assign('/login');
    },
    onError: () => {
      toast.error('Link invalido ou expirado. Solicite um novo.');
    },
  });
}
