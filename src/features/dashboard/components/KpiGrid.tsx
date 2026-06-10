import {
  DollarSign,
  CalendarDays,
  UserPlus,
  UserCheck,
  UserX,
  Receipt,
  CheckCircle2,
  Target,
} from 'lucide-react';
import { KpiCard, type KpiCardDelta } from './KpiCard';
import { INACTIVE_CLIENT_DAYS } from '@/features/dashboard/types';
import type { DashboardData, KpiWithDelta } from '@/features/dashboard/types';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Converte KpiWithDelta → KpiCardDelta. `undefined` quando não há base de comparação. */
function toDelta(kpi: KpiWithDelta): KpiCardDelta | undefined {
  if (kpi.deltaPct === null) return undefined;
  return {
    value: Math.round(Math.abs(kpi.deltaPct)),
    direction: kpi.deltaPct >= 0 ? 'up' : 'down',
  };
}

interface Props {
  data: DashboardData;
}

export function KpiGrid({ data }: Props) {
  // ---- STAFF: fileira única ----
  if (data.role === 'staff') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          index={0}
          label="Meus agendamentos hoje"
          value={String(data.kpis.todayAppointments)}
          icon={CalendarDays}
        />
        <KpiCard
          index={1}
          label="Clientes ativos"
          value={String(data.kpis.activeClients)}
          icon={UserCheck}
          hint={`Visita nos últimos ${INACTIVE_CLIENT_DAYS} dias`}
        />
        <KpiCard
          index={2}
          label="Clientes inativos"
          value={String(data.kpis.inactiveClients)}
          icon={UserX}
          hint={`Sem visita há +${INACTIVE_CLIENT_DAYS} dias`}
        />
      </div>
    );
  }

  // ---- ADMIN: 2 fileiras ----
  const { kpis } = data;

  return (
    <div className="space-y-4">
      {/* Fileira 1 — KPIs com delta (topo nobre) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          index={0}
          label="Faturamento (mês)"
          value={brl.format(kpis.monthRevenue.value)}
          icon={DollarSign}
          delta={toDelta(kpis.monthRevenue)}
        />
        <KpiCard
          index={1}
          label="Ticket médio"
          value={brl.format(kpis.avgTicket.value)}
          icon={Receipt}
          delta={toDelta(kpis.avgTicket)}
        />
        <KpiCard
          index={2}
          label="Novos clientes (mês)"
          value={String(kpis.newClients.value)}
          icon={UserPlus}
          delta={toDelta(kpis.newClients)}
        />
        <KpiCard
          index={3}
          label="Agendamentos hoje"
          value={String(kpis.todayAppointments)}
          icon={CalendarDays}
        />
      </div>

      {/* Fileira 2 — KPIs operacionais (sem delta) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          index={4}
          label="Taxa de conclusão"
          value={kpis.completionRate === null ? '—' : `${Math.round(kpis.completionRate)}%`}
          icon={CheckCircle2}
          hint="Concluídos ÷ ativos do mês"
        />
        <KpiCard
          index={5}
          label="Novos leads (mês)"
          value={String(kpis.monthNewLeads)}
          icon={Target}
        />
        <KpiCard
          index={6}
          label="Clientes ativos"
          value={String(kpis.activeClients)}
          icon={UserCheck}
          hint={`Visita nos últimos ${INACTIVE_CLIENT_DAYS} dias`}
        />
        <KpiCard
          index={7}
          label="Clientes inativos"
          value={String(kpis.inactiveClients)}
          icon={UserX}
          hint={`Sem visita há +${INACTIVE_CLIENT_DAYS} dias`}
        />
      </div>
    </div>
  );
}
