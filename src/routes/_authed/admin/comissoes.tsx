// src/routes/_authed/admin/comissoes.tsx
import { createFileRoute } from '@tanstack/react-router';
import { CommissionSettlementPage } from '@/features/finance/components/CommissionSettlementPage';

export const Route = createFileRoute('/_authed/admin/comissoes')({
  component: RouteComponent,
});

function RouteComponent() {
  return <CommissionSettlementPage />;
}