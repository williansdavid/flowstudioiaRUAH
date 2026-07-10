// src/features/report/components/SalesTab.tsx
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Package,
  Ticket,
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
} from 'recharts';
import { PeriodFilter } from '@/features/finance/components/PeriodFilter';
import { CustomRangePicker } from '@/features/finance/components/CustomRangePicker';
import { useFinanceSummary } from '@/features/finance/hooks';
import {
  useRevenueByServiceReport,
  useTopProductsReport,
  useAppointmentsCount,
} from '../hooks';
import { getPeriodRange } from '../utils/periodRange';
import type { FinancePeriod, PeriodRange } from '@/features/finance/types';
import type { TopServiceRow, TopProductRow } from '../types';

// ─── Accent system ───
type CardAccent = keyof typeof CARD_ACCENTS;

const CARD_ACCENTS = {
  emerald: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/20',
  rose: 'from-rose-500/15 to-rose-500/5 border-rose-500/20',
  violet: 'from-violet-500/15 to-violet-500/5 border-violet-500/20',
  blue: 'from-blue-500/15 to-blue-500/5 border-blue-500/20',
  amber: 'from-amber-500/15 to-amber-500/5 border-amber-500/20',
  cyan: 'from-cyan-500/15 to-cyan-500/5 border-cyan-500/20',
};

const ICON_WRAPPER: Record<CardAccent, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-400',
  rose: 'bg-rose-500/15 text-rose-400',
  violet: 'bg-violet-500/15 text-violet-400',
  blue: 'bg-blue-500/15 text-blue-400',
  amber: 'bg-amber-500/15 text-amber-400',
  cyan: 'bg-cyan-500/15 text-cyan-400',
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

// ─── Tooltip ───
function ServiceTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; dataKey?: string; value?: number; payload: TopServiceRow }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-emerald-500/20 bg-zinc-900/95 px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium text-emerald-200">{label}</p>
      <p className="text-zinc-300">Receita: {fmt(Number(payload[0]?.value ?? 0))}</p>
    </div>
  );
}

// ─── KPI Card ───
function KpiCard({
  delay,
  icon,
  label,
  value,
  subtitle,
  accent,
}: {
  delay: number;
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  accent: CardAccent;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        'flex flex-col gap-1 rounded-2xl border bg-gradient-to-b p-4',
        CARD_ACCENTS[accent],
      )}
    >
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-slate-100">{value}</span>
          {subtitle && (
            <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>
        <div className={cn('rounded-lg p-2', ICON_WRAPPER[accent])}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Ranking table ───
function RankingTable({
  data,
  isLoading,
  isError,
}: {
  data: (TopServiceRow | TopProductRow)[];
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-48 items-center justify-center gap-2 text-sm text-red-400">
        <AlertCircle className="h-4 w-4" />
        Erro ao carregar dados.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-zinc-500">
        Nenhum dado no período.
      </div>
    );
  }

  const isService = data.length > 0 && 'serviceName' in data[0]!;
  const getName = (item: TopServiceRow | TopProductRow) =>
    isService ? (item as TopServiceRow).serviceName : (item as TopProductRow).productName;
  const getId = (item: TopServiceRow | TopProductRow) =>
    isService ? (item as TopServiceRow).serviceId : (item as TopProductRow).productId;

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-zinc-800 text-zinc-500">
          <th className="pb-2 pr-2 font-medium">#</th>
          <th className="pb-2 font-medium">Nome</th>
          <th className="pb-2 text-right font-medium">Qtd</th>
          <th className="pb-2 text-right font-medium">Receita</th>
        </tr>
      </thead>
      <tbody className="text-zinc-300">
        {data.map((item, i) => (
          <tr key={getId(item)} className="border-b border-zinc-800/60">
            <td className="py-2 pr-2 text-zinc-500">{i + 1}</td>
            <td className="py-2">{getName(item)}</td>
            <td className="py-2 text-right">{item.quantity}</td>
            <td className="py-2 text-right text-emerald-400">{fmt(item.revenue)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Main ───
export function SalesTab() {
  const [period, setPeriod] = useState<FinancePeriod>('month');
  const [customRange, setCustomRange] = useState<PeriodRange>(defaultCustomRange);
  const input = period === 'custom' ? { period, customRange } : { period };

  const range = useMemo(
    () => getPeriodRange(period, period === 'custom' ? customRange : undefined),
    [period, customRange],
  );

  const servicesQ = useRevenueByServiceReport(input);
  const productsQ = useTopProductsReport(input);
  const summaryQ = useFinanceSummary(input);
  const appointmentsCountQ = useAppointmentsCount(range.start, range.end);

  const loading =
    servicesQ.isLoading ||
    productsQ.isLoading ||
    summaryQ.isLoading ||
    appointmentsCountQ.isLoading;

  const error =
    servicesQ.isError ||
    productsQ.isError ||
    summaryQ.isError ||
    appointmentsCountQ.isError;

  const revenue = summaryQ.data?.revenue.value ?? 0;
  const totalAppointments = appointmentsCountQ.data ?? 0;
  const ticketMedio = totalAppointments > 0 ? revenue / totalAppointments : 0;

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-500">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>Erro ao carregar relatórios de vendas.</p>
      </div>
    );
  }

  const services = servicesQ.data ?? [];
  const products = productsQ.data ?? [];

  return (
    <div className="w-full min-w-0 space-y-6 pb-8">
      {/* Header + Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-zinc-100">Vendas & Serviços</h1>
          <p className="text-sm text-zinc-500">
            Desempenho de serviços, produtos e ticket médio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
      </div>

      {period === 'custom' && (
        <CustomRangePicker value={customRange} onChange={setCustomRange} />
      )}

      {/* Ticket Médio */}
      <KpiCard
        delay={0}
        icon={<Ticket className="size-5" />}
        label="TICKET MÉDIO"
        value={`R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        subtitle={`${totalAppointments} agendamentos concluídos no período`}
        accent="blue"
      />

      {/* Serviços Mais Vendidos */}
      <div className={cn('rounded-xl border bg-gradient-to-b p-5', CARD_ACCENTS.emerald)}>
        <div className="mb-4 flex items-center gap-2">
          <div className={cn('rounded-lg p-1.5', ICON_WRAPPER.emerald)}>
            <Trophy className="size-4" />
          </div>
          <h3 className="font-semibold text-zinc-100">Serviços Mais Vendidos</h3>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RankingTable data={services} isLoading={false} isError={false} />

          {services.length > 0 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={services.slice(0, 8)}>
                  <XAxis
                    dataKey="serviceName"
                    stroke="#52525b"
                    tick={{ fill: '#a1a1aa', fontSize: 10 }}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(v: number) =>
                      `R$${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
                    }
                    stroke="#52525b"
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  />
                  <Tooltip content={<ServiceTooltip />} />
                  <Bar dataKey="revenue" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenueByServiceCard data={services} isLoading={servicesQ.isLoading} isError={servicesQ.isError} />
        <ProductsCard data={products} isLoading={productsQ.isLoading} isError={productsQ.isError} />
      </div>
    </div>
  );
}

// ─── Receita por Serviço (barras horizontais) ───
function RevenueByServiceCard({
  data,
  isLoading,
  isError,
}: {
  data: TopServiceRow[];
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return (
      <div className={cn('rounded-xl border bg-gradient-to-b p-5', CARD_ACCENTS.violet)}>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn('rounded-xl border bg-gradient-to-b p-5', CARD_ACCENTS.violet)}>
        <div className="flex h-64 items-center justify-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          Erro ao carregar dados.
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border bg-gradient-to-b p-5', CARD_ACCENTS.violet)}>
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-violet-500/15 p-1.5 text-violet-400">
          <BarChart3 className="size-4" />
        </div>
        <h3 className="font-semibold text-zinc-100">Receita por Serviço</h3>
      </div>

      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-zinc-500">
          Nenhum dado no período.
        </div>
      ) : (
        <div className="h-72 space-y-3 overflow-y-auto pr-1">
          {data.map((item, i) => {
            const maxRevenue = data[0]?.revenue ?? 1;
            const widthPct = Math.max((item.revenue / maxRevenue) * 100, 4);
            return (
              <div key={item.serviceId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate text-zinc-300">{item.serviceName}</span>
                  <span className="shrink-0 pl-2 text-zinc-400">
                    {fmt(item.revenue)} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.04 }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Produtos ───
function ProductsCard({
  data,
  isLoading,
  isError,
}: {
  data: TopProductRow[];
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <div className={cn('rounded-xl border bg-gradient-to-b p-5', CARD_ACCENTS.amber)}>
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-amber-500/15 p-1.5 text-amber-400">
          <Package className="size-4" />
        </div>
        <h3 className="font-semibold text-zinc-100">Produtos Mais Vendidos</h3>
      </div>
      <RankingTable data={data} isLoading={isLoading} isError={isError} />
    </div>
  );
}