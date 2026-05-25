import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { login } from '@/lib/auth/login';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: '/admin' });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      const result = await login({ data: { email, password } });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success('Bem-vindo!');
      await navigate({ to: '/admin', reloadDocument: true });
    } catch (err) {
      console.error('[login] erro inesperado', err);
      toast.error('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Entrar"
          description="Acesse o painel administrativo do seu studio."
        />

        <form
          onSubmit={handleSubmit}
          method="POST"
          action="?"
          autoComplete="on"
          className="space-y-5"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="email" required>
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="voce@exemplo.com"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" required>
                Senha
              </Label>
                                {/* TODO: Habilitar quando rota /forgot-password for criada (Fase Auth Recovery) */}
                                <button
                                  type="button"
                                  disabled
                                  className="text-xs text-neutral-400/50 cursor-not-allowed transition-colors"
                                  title="Em breve"
                                >
                                  Esqueci minha senha
                                </button>
            </div>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="••••••••"
            />
          </div>

		<Button type="submit" variant="brand" size="lg" loading={loading} className="w-full">
		  Entrar
		</Button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-500 lg:text-left">
          Ao continuar, você concorda com os termos de uso do studio.
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
