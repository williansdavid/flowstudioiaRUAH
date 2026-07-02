import { DollarSign, Receipt, CalendarCheck2, TrendingDown, Scale, Percent } from 'lucide-react';
import { KpiCard, type KpiCardDelta } from '@/features/dashboard/components/KpiCard';
import type { FinanceKpi, FinanceSummary } from '../types';

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <KpiCard
        index={0}
        label="Faturamento"
        value={brl.format(summary.revenue.value)}
        icon={DollarSign}
        delta={toDelta(summary.revenue)}
      />
      <KpiCard
        index={1}
        label="Ticket médio"
        value={brl.format(summary.avgTicket.value)}
        icon={Receipt}
        delta={toDelta(summary.avgTicket)}
      />
      <KpiCard
        index={2}
        label="Atendimentos"
        value={String(summary.appointmentsCount.value)}
        icon={CalendarCheck2}
        delta={toDelta(summary.appointmentsCount)}
      />
      <KpiCard
        index={3}
        label="Despesas"
        value={brl.format(summary.expenses.value)}
        icon={TrendingDown}
        delta={toDelta(summary.expenses)}
      />
      <KpiCard
        index={4}
        label="Comissões"
        value={brl.format(summary.totalCommission.value)}
        icon={Percent}
        hint="A repassar aos profissionais"
        delta={toDelta(summary.totalCommission)}
      />
      <KpiCard
        index={5}
        label="Saldo líquido"
        value={brl.format(summary.netBalance.value)}
        icon={Scale}
        delta={toDelta(summary.netBalance)}
      />
    </div>
  );
}
