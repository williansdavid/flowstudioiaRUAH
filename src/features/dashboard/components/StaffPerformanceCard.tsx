// src/features/dashboard/components/StaffPerformanceCard.tsx
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, Users, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getStaffPerformanceReport } from '@/features/report/server/getStaffPerformanceReport';

const fmtPct = (n: number | null) =>
  n !== null ? `${n}%` : '—';

export function StaffPerformanceCard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['report', 'staffPerformance', 'month'],
    queryFn: () =>
      getStaffPerformanceReport({
        data: { period: 'month' },
      }),
  });

  const totalAppointments =
    data?.reduce((s, r) => s + r.appointmentsCount, 0) ?? 0;
  const validRates = data?.filter((r) => r.occupancyRate !== null) ?? [];
  const avgOccupancy =
    validRates.length > 0
      ? Math.round(
          validRates.reduce((s, r) => s + (r.occupancyRate ?? 0), 0) /
            validRates.length,
        )
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/25">
          <Users className="h-4 w-4" />
        </span>
        <h3 className="text-base font-semibold text-zinc-100">
          Desempenho da Equipe
        </h3>
        <span className="ml-auto text-xs text-zinc-500">mês</span>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex h-56 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex h-56 flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="h-6 w-6 text-zinc-500" />
          <p className="text-sm text-zinc-400">
            Não foi possível carregar os dados.
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-md border border-violet-500/30 px-3 py-1.5 text-sm text-violet-300 transition hover:bg-violet-500/10"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && (!data || data.length === 0) && (
        <div className="flex h-56 items-center justify-center">
          <p className="text-sm text-zinc-500">Nenhum dado no período.</p>
        </div>
      )}

      {/* Data */}
      {!isLoading && !isError && data && data.length > 0 && (
        <>
          {/* Mini resumo */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-zinc-800/50 p-3 text-center">
              <p className="text-2xl font-bold text-zinc-100">
                {totalAppointments}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                Agendamentos
              </p>
            </div>
            <div className="rounded-lg bg-zinc-800/50 p-3 text-center">
              <p className="text-2xl font-bold text-zinc-100">
                {fmtPct(avgOccupancy)}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                Ocupação média
              </p>
            </div>
          </div>

          {/* Ranking */}
          <div className="space-y-1">
            {data.map((item, i) => {
              const maxCount = data[0]?.appointmentsCount ?? 1;
              const barWidth = Math.max(
                (item.appointmentsCount / maxCount) * 100,
                4,
              );

              return (
                <div
                  key={item.staffId}
                  className="rounded-lg px-3 py-2 transition-colors hover:bg-zinc-800/50"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 w-5 text-xs font-bold text-zinc-500">
                        {i + 1}
                      </span>
                      <span className="truncate text-sm font-medium text-zinc-200">
                        {item.staffName}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-zinc-400">
                      {item.appointmentsCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-violet-500 transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        'shrink-0 text-xs font-medium tabular-nums',
                        item.occupancyRate !== null && item.occupancyRate >= 70
                          ? 'text-emerald-400'
                          : item.occupancyRate !== null &&
                              item.occupancyRate >= 40
                            ? 'text-amber-400'
                            : item.occupancyRate !== null
                              ? 'text-rose-400'
                              : 'text-zinc-500',
                      )}
                    >
                      {fmtPct(item.occupancyRate)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}