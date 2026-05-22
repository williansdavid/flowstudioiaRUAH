import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { login } from '@/lib/auth/login';

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    // Já logado? Vai direto pro admin
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow-sm"
        noValidate
      >
        <h1 className="text-xl font-semibold">Entrar</h1>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="mt-1 w-full rounded border px-3 py-2 outline-none focus:border-neutral-900 disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="mt-1 w-full rounded border px-3 py-2 outline-none focus:border-neutral-900 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
