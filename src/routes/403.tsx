import { createFileRoute, Link } from '@tanstack/react-router';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/403')({
  component: ForbiddenComponent,
});

function ForbiddenComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold text-zinc-900 mb-2">
          Acesso negado
        </h1>

        <p className="text-zinc-600 mb-8">
          Você não tem permissão para acessar esta página. Se acredita que isso
          é um erro, entre em contato com o administrador do studio.
        </p>

        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
