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
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Financeiro</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Acompanhe receitas, despesas e fluxo de caixa.
      </p>
    </div>
  );
}
