import {
  DollarSign,
  CalendarDays,
  UserPlus,
  UserCheck,
  UserX,
} from 'lucide-react';
import { KpiCard } from './KpiCard';
import { INACTIVE_CLIENT_DAYS } from '@/features/dashboard/types';
import type { DashboardData } from '@/features/dashboard/types';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

interface Props {
  data: DashboardData;
}

export function KpiGrid({ data }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {data.role === 'admin' ? (
        <>
          <KpiCard
            label="Faturamento (mês)"
            value={brl.format(data.kpis.monthRevenue)}
            icon={DollarSign}
          />
          <KpiCard
            label="Agendamentos hoje"
            value={String(data.kpis.todayAppointments)}
            icon={CalendarDays}
          />
          <KpiCard
            label="Novos leads (mês)"
            value={String(data.kpis.monthNewLeads)}
            icon={UserPlus}
          />
        </>
      ) : (
        <KpiCard
          label="Meus agendamentos hoje"
          value={String(data.kpis.todayAppointments)}
          icon={CalendarDays}
        />
      )}

      <KpiCard
        label="Clientes ativos"
        value={String(data.kpis.activeClients)}
        icon={UserCheck}
        hint={`Visita nos últimos ${INACTIVE_CLIENT_DAYS} dias`}
      />
      <KpiCard
        label="Clientes inativos"
        value={String(data.kpis.inactiveClients)}
        icon={UserX}
        hint={`Sem visita há +${INACTIVE_CLIENT_DAYS} dias`}
      />
    </div>
  );
}
