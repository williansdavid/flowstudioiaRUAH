// src/routes/_authed/admin/index.tsx
import { RevenueByStaffChart } from '@/features/dashboard/components/RevenueByStaffChart';
import { OccupancyRateChart } from '@/features/dashboard/components/OccupancyRateChart';
import { StaffPerformanceCard } from '@/features/dashboard/components/StaffPerformanceCard';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { getDashboardData, KpiGrid } from '@/features/dashboard';
import { ErrorState } from '@/features/utils/feedback';

const dashboardQuery = {
  queryKey: ['dashboard'] as const,
  queryFn: () => getDashboardData(),
};

export const Route = createFileRoute('/_authed/admin/')({
  staticData: { title: 'Visão geral' },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(dashboardQuery);
  },
  component: DashboardPage,
  errorComponent: DashboardError,
});

function DashboardPage() {
  const { data } = useSuspenseQuery(dashboardQuery);

  if (data.role !== 'admin') {
    return (
      <div className="space-y-6">
        <KpiGrid data={data} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* KPIs: mobile por último, desktop ocupa a linha inteira no topo */}
      <div className="order-4 lg:order-1 lg:col-span-2">
        <KpiGrid data={data} />
      </div>

      {/* Receita: mobile no topo, desktop coluna direita da 2ª linha */}
      <div className="order-1 lg:order-2">
        <RevenueByStaffChart />
      </div>

      {/* Ocupação: mobile abaixo da receita, desktop coluna esquerda da 2ª linha */}
      <div className="order-2 lg:order-3">
        <OccupancyRateChart />
      </div>

      {/* Desempenho da Equipe: mobile último, desktop full width na 3ª linha */}
      <div className="order-3 lg:order-4 lg:col-span-2">
        <StaffPerformanceCard />
      </div>
    </div>
  );
}

function DashboardError({ error, reset }: ErrorComponentProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return (
    <ErrorState
      error={error}
      message="Não foi possível carregar o dashboard. Tente novamente."
      onRetry={async () => {
        await queryClient.invalidateQueries({
          queryKey: dashboardQuery.queryKey,
        });
        reset();
        await router.invalidate();
      }}
    />
  );
}