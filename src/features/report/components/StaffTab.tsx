// src/features/report/components/StaffTab.tsx
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  DollarSign,
  BarChart3,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { PeriodFilter } from '@/features/finance/components/PeriodFilter';
import { CustomRangePicker } from '@/features/finance/components/CustomRangePicker';
import { useStaffPerformanceReport, useOccupancyRateReport } from '../hooks';
import type { FinancePeriod, PeriodRange } from '@/features/finance/types';
import type { StaffPerformanceRow, OccupancyRateRow } from '../types';

// ─── Accent system ───
type CardAccent = keyof typeof CARD_ACCENTS;
const CARD_ACCENTS = {
  emerald: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/20',
  amber: 'from-amber-500/15 to-amber-500/5 border-amber-500/20',
  violet: 'from-violet-500/15 to-violet-500/5 border-violet-500/20',
};
const ICON_WRAPPER: Record<CardAccent, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-400',
  amber: 'bg-amber-500/15 text-amber-400',
  violet: 'bg-violet-500/15 text-violet-400',
};

const fmt = (n: number) =>
  `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

function defaultCustomRange(): PeriodRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

// ─── Tooltip do gráfico de ocupação ───
function OccupancyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number; payload: OccupancyRateRow }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium text-zinc-100">{label}</p>
      <p className="text-emerald-400">Ocupação: {row.occupancyRate}%</p>
      <p className="text-rose-400">Cancelamentos: {row.cancellations}</p>
      <p className="text-amber-400">No-shows: {row.noShows}</p>
    </div>
  );
}

// ─── Card 1: Ranking de Profissionais ───
function StaffRankingTable({
  data,
  isLoading,
  isError,
}: {
  data: StaffPerformanceRow[];
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-rose-400">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm">Erro ao carregar dados.</span>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <span className="text-sm">Nenhum dado no período.</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-800/50 [&::-webkit-scrollbar-thumb]:bg-orange-500/60 [&::-webkit-scrollbar-thumb:hover]:bg-orange-500/80 [&::-webkit-scrollbar-thumb]:rounded-full">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="pb-3 font-medium">#</th>
            <th className="pb-3 font-medium">Profissional</th>
            <th className="pb-3 font-medium">Agend.</th>
            <th className="pb-3 font-medium">Faturamento</th>
            <th className="pb-3 font-medium">Comissão</th>
            <th className="pb-3 font-medium">Ocupação</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={item.staffId} className="border-b border-border/50">
              <td className="py-3 text-muted-foreground">{i + 1}</td>
              <td className="py-3 font-medium text-zinc-100">
                {item.staffName}
              </td>
              <td className="py-3">{item.appointmentsCount}</td>
              <td className="py-3">{fmt(item.revenue)}</td>
              <td className="py-3">{fmt(item.commission)}</td>
              <td className="py-3">
                <span
                  className={cn(
                    'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                    item.occupancyRate !== null && item.occupancyRate >= 70
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : item.occupancyRate !== null && item.occupancyRate >= 40
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-rose-500/15 text-rose-400',
                  )}
                >
                  {item.occupancyRate !== null ? `${item.occupancyRate}%` : '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Card 2: Comissões ───
function CommissionCards({
  data,
  isLoading,
  isError,
}: {
  data: StaffPerformanceRow[];
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-rose-400">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm">Erro ao carregar dados.</span>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <span className="text-sm">Nenhum dado no período.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div
          key={item.staffId}
          className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3"
        >
          <span className="text-sm text-zinc-100">{item.staffName}</span>
          <span className="text-sm font-semibold text-amber-400">
            {fmt(item.commission)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Card 3: Ocupação Diária ───
function OccupancyChart({
  data,
  isLoading,
  isError,
}: {
  data: OccupancyRateRow[];
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-rose-400">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm">Erro ao carregar dados.</span>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <span className="text-sm">Nenhum dado no período.</span>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => {
              const d = new Date(v + 'T12:00:00');
              return d.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              });
            }}
            stroke="#52525b"
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(v: number) => `${v}%`}
            stroke="#52525b"
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
          />
          <Tooltip content={<OccupancyTooltip />} />
          <Bar
            dataKey="occupancyRate"
            name="Ocupação"
            fill="#a78bfa"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main ───
export function StaffTab() {
  const [period, setPeriod] = useState<FinancePeriod>('month');
  const [customRange, setCustomRange] = useState<PeriodRange>(
    defaultCustomRange,
  );

  const input = period === 'custom' ? { period, customRange } : { period };

  const staffQ = useStaffPerformanceReport(input);
  const occupancyQ = useOccupancyRateReport(input);

  if (staffQ.isLoading || occupancyQ.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (staffQ.isError || occupancyQ.isError) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-rose-400">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm">
          Erro ao carregar relatórios de profissionais.
        </span>
      </div>
    );
  }

  const staff = staffQ.data ?? [];
  const occupancy = occupancyQ.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Profissionais</h2>
          <p className="text-sm text-muted-foreground">
            Desempenho, comissões e ocupação da equipe
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodFilter value={period} onChange={setPeriod} />
          {period === 'custom' && (
            <CustomRangePicker value={customRange} onChange={setCustomRange} />
          )}
        </div>
      </div>

      {/* Grid — Ranking full width, Comissões + Ocupação abaixo */}
      <div className="space-y-6">
        {/* Card 1 — Ranking (full width) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          className={cn(
            'rounded-xl border bg-gradient-to-br p-5',
            CARD_ACCENTS.emerald,
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className={cn('rounded-lg p-2', ICON_WRAPPER.emerald)}>
              <Award className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-medium text-zinc-100">
              Ranking de Profissionais
            </h3>
          </div>
          <StaffRankingTable
            data={staff}
            isLoading={staffQ.isLoading}
            isError={staffQ.isError}
          />
        </motion.div>

        {/* Cards 2+3 em grid 2 colunas */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Card 2 — Comissões */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className={cn(
              'rounded-xl border bg-gradient-to-br p-5',
              CARD_ACCENTS.amber,
            )}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className={cn('rounded-lg p-2', ICON_WRAPPER.amber)}>
                <DollarSign className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-medium text-zinc-100">Comissões</h3>
            </div>
            <CommissionCards
              data={staff}
              isLoading={staffQ.isLoading}
              isError={staffQ.isError}
            />
          </motion.div>

          {/* Card 3 — Ocupação */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className={cn(
              'rounded-xl border bg-gradient-to-br p-5',
              CARD_ACCENTS.violet,
            )}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className={cn('rounded-lg p-2', ICON_WRAPPER.violet)}>
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-medium text-zinc-100">
                Ocupação Diária
              </h3>
            </div>
            <OccupancyChart
              data={occupancy}
              isLoading={occupancyQ.isLoading}
              isError={occupancyQ.isError}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}