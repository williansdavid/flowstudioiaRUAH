import { createFileRoute } from '@tanstack/react-router';
import { requirePermission } from '@/lib/auth/session';

export const Route = createFileRoute('/admin/finance')({
  beforeLoad: ({ context }) => {
    requirePermission(context.user, 'finance.view');
  },
  component: FinanceRouteComponent,
});

function FinanceRouteComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-zinc-900">Financeiro</h1>
      <p className="text-zinc-600 mt-2">
        Acompanhe receitas, despesas e fluxo de caixa.
      </p>
    </div>
  );
}
