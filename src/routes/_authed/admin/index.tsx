import { RevenueByStaffChart } from '@/features/dashboard/components/RevenueByStaffChart';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { getDashboardData, KpiGrid, RecentLeads } from '@/features/dashboard';
import { ErrorState } from '@/components/feedback';

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

  return (
    <div className="space-y-6">
      <KpiGrid data={data} />

      {data.role === 'admin' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentLeads leads={data.recentLeads} />
          <RevenueByStaffChart />
        </div>
      ) : null}
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
