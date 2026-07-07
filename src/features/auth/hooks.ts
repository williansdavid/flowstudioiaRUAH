import { useEffect, useState } from 'react';
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
      queryClient.clear();

      const role = session?.profile?.role;
      const redirectTo = role === 'client' ? '/cliente' : '/admin';
      await router.navigate({ to: redirectTo });
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
 * Etapa 1.5: estabelece a sessão a partir do link de e-mail.
 *
 * O link traz ?token_hash=<hash>&type=recovery|invite na QUERY.
 * verifyOtp troca o token_hash por uma sessão real no browser — sem
 * passar pelo endpoint /verify do Supabase (que consumiria o token no
 * clique e quebraria com scanners de e-mail).
 *
 * O e-mail é disparado por server fn (createSupabaseServer), que NÃO
 * gera code_verifier no browser — por isso usamos verifyOtp (token_hash),
 * e o client browser permanece SEM flowType 'pkce'.
 *
 * Compartilhado por reset (recovery) e primeiro-acesso (invite):
 * o `type` vem da URL e é repassado ao verifyOtp.
 *
 * Estados consumidos pelo RecoverySessionGate:
 *   establishing → ready → (formulário de senha liberado)
 *               ↘ error  → "link inválido/expirado"
 */
type RecoveryStatus = 'establishing' | 'ready' | 'error';

const RECOVERY_OTP_TYPES = ['recovery', 'invite', 'signup', 'email'] as const;
type RecoveryOtpType = (typeof RECOVERY_OTP_TYPES)[number];

function parseOtpType(value: string | null): RecoveryOtpType | null {
  return RECOVERY_OTP_TYPES.includes(value as RecoveryOtpType)
    ? (value as RecoveryOtpType)
    : null;
}

export function useEstablishRecoverySession() {
  const [status, setStatus] = useState<RecoveryStatus>('establishing');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function fail(msg: string) {
      if (cancelled) return;
      setErrorMsg(msg);
      setStatus('error');
    }

    async function run() {
      const params = new URLSearchParams(window.location.search);

      // 1. Erro propagado pelo próprio Supabase na URL (link expirado etc.)
      const errCode = params.get('error_code') ?? params.get('error');
      if (errCode) {
        fail(
          errCode === 'otp_expired'
            ? 'Este link expirou. Solicite um novo.'
            : 'Link inválido ou expirado. Solicite um novo.',
        );
        return;
      }

      // 2. Token + tipo vindos do template (token_hash + type)
      const tokenHash = params.get('token_hash');
      const type = parseOtpType(params.get('type'));

      if (!tokenHash || !type) {
        fail('Link inválido ou expirado. Solicite um novo.');
        return;
      }

      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      });

      if (cancelled) return;

      if (error) {
        fail('Link inválido ou expirado. Solicite um novo.');
        return;
      }

      // Limpa o token da URL — evita reuso/replay ao recarregar.
      window.history.replaceState(null, '', window.location.pathname);
      setStatus('ready');
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, errorMsg } as const;
}

import type { AuthError } from '@supabase/supabase-js';

/**
 * Traduz erro do updateUser (etapa 2 do reset) para PT-BR.
 * Aqui a sessão JÁ está válida (garantida pelo RecoverySessionGate),
 * então o erro é sobre a SENHA — nunca sobre o link.
 * Mapeia por error.code (estável) com fallback por mensagem.
 */
function mapUpdatePasswordError(error: unknown): string {
  const code = (error as Partial<AuthError>)?.code;
  const message = (error as Partial<AuthError>)?.message ?? '';

  if (code === 'same_password' || /should be different/i.test(message)) {
    return 'A nova senha precisa ser diferente da senha atual.';
  }

  if (code === 'weak_password' || /at least|weak password/i.test(message)) {
    return 'Senha muito fraca. Use pelo menos 6 caracteres.';
  }

  return 'Não foi possível atualizar a senha. Tente novamente.';
}

/**
 * Etapa 2: define a nova senha (client direto).
 *
 * A sessão já foi estabelecida pelo useEstablishRecoverySession
 * (exchangeCodeForSession). Por isso updateUser roda client-side.
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (password: string) => {
      const supabase = getSupabaseBrowser();

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error; // preserva error.code para o mapeador

      toast.success('Senha atualizada com sucesso. Faça login.');

      // signOut em background — não bloqueia nem aborta o fluxo.
      void supabase.auth.signOut().catch(() => {});

      // Hard redirect: garante navegação + reset total de sessão/estado,
      // imune à remontagem da árvore pelo @supabase/ssr ao rotacionar cookies.
      window.location.assign('/login');
    },
    onError: (error) => {
      toast.error(mapUpdatePasswordError(error));
    },
  });
}

