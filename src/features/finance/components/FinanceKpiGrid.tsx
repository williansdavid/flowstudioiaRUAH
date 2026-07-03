import { CalendarCheck2, TrendingDown, Scale, Percent } from 'lucide-react';
import { KpiCard, type KpiCardDelta } from '@/features/dashboard/components/KpiCard';
import type { FinanceKpi, FinanceSummary } from '../types';

// NOTA: Faturamento e Ticket médio já aparecem no Dashboard (KpiGrid),
// por isso não são repetidos aqui — o Financeiro foca no que é exclusivo dele.

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function toDelta(kpi: FinanceKpi): KpiCardDelta | undefined {
  if (kpi.deltaPct === null) return undefined;
  return {
    value: Math.round(Math.abs(kpi.deltaPct)),
    direction: kpi.deltaPct >= 0 ? 'up' : 'down',
  };
}

interface Props {
  summary: FinanceSummary;
}

export function FinanceKpiGrid({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        index={0}
        label="Atendimentos"
        value={String(summary.appointmentsCount.value)}
        icon={CalendarCheck2}
        delta={toDelta(summary.appointmentsCount)}
      />
      <KpiCard
        index={1}
        label="Despesas"
        value={brl.format(summary.expenses.value)}
        icon={TrendingDown}
        delta={toDelta(summary.expenses)}
      />
      <KpiCard
        index={2}
        label="Comissões"
        value={brl.format(summary.totalCommission.value)}
        icon={Percent}
        hint="A repassar aos profissionais"
        delta={toDelta(summary.totalCommission)}
      />
      <KpiCard
        index={3}
        label="Saldo líquido"
        value={brl.format(summary.netBalance.value)}
        icon={Scale}
        delta={toDelta(summary.netBalance)}
      />
    </div>
  );
}
