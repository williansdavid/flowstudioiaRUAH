// src/features/report/components/OperationalTab.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  XCircle,
  UserX,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Area, AreaChart } from 'recharts';
import { PeriodFilter } from '@/features/finance/components/PeriodFilter';
import { CustomRangePicker } from '@/features/finance/components/CustomRangePicker';
import { useOperationalOverview, useOccupancyRateReport, useNewVsReturningReport } from '../hooks';
import type { FinancePeriod, PeriodRange } from '@/features/finance/types';
import type { OccupancyRateRow, NewVsReturningRow, OperationalOverviewRow } from '../types';

// ─── Accent system ───
const CARD_ACCENTS = {
  blue: 'from-blue-500/15 to-blue-500/5 border-blue-500/20',
  rose: 'from-rose-500/15 to-rose-500/5 border-rose-500/20',
  amber: 'from-amber-500/15 to-amber-500/5 border-amber-500/20',
  emerald: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/20',
  violet: 'from-violet-500/15 to-violet-500/5 border-violet-500/20',
} as const;

const ICON_WRAPPER: Record<string, string> = {
  blue: 'bg-blue-500/15 text-blue-400',
  rose: 'bg-rose-500/15 text-rose-400',
  amber: 'bg-amber-500/15 text-amber-400',
  emerald: 'bg-emerald-500/15 text-emerald-400',
  violet: 'bg-violet-500/15 text-violet-400',
};

function defaultCustomRange(): PeriodRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

// ─── Card 1: Visão Geral ───
function OverviewCards({
  data,
  isLoading,
  isError,
}: {
  data: OperationalOverviewRow | undefined;
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

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <span className="text-sm">Nenhum dado no período.</span>
      </div>
    );
  }

  const cards = [
    {
      accent: 'blue' as const,
      icon: CalendarCheck,
      label: 'Agendamentos',
      value: data.totalAppointments,
    },
    {
      accent: 'rose' as const,
      icon: XCircle,
      label: 'Cancelamentos',
      value: data.cancelledAppointments,
    },
    {
      accent: 'amber' as const,
      icon: UserX,
      label: 'Não Compareceu',
      value: data.noShowAppointments,
    },
    {
      accent: 'emerald' as const,
      icon: TrendingUp,
      label: 'Confirmados',
      value: data.confirmedAppointments + data.completedAppointments,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${CARD_ACCENTS[card.accent]} p-4`}
          >
            <div className={`mb-2 inline-flex rounded-lg p-2 ${ICON_WRAPPER[card.accent]}`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Card 2: Novos vs Recorrentes ───
function NewVsReturningChart({
  data,
  isLoading,
  isError,
}: {
  data: NewVsReturningRow[] | undefined;
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
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            stroke="#52525b"
          />
          <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} stroke="#52525b" />
          <Tooltip
            contentStyle={{
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          <Bar
            dataKey="newClients"
            name="Novos"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="returningClients"
            name="Recorrentes"
            fill="#a78bfa"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Card 3: Ocupação Diária ───
function OccupancyChart({
  data,
  isLoading,
  isError,
}: {
  data: OccupancyRateRow[] | undefined;
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
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
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
          <Tooltip
            contentStyle={{
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          <Area
            type="monotone"
            dataKey="occupancyRate"
            name="Ocupação"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main ───
export function OperationalTab() {
  const [period, setPeriod] = useState<FinancePeriod>('month');
  const [customRange, setCustomRange] = useState<PeriodRange>(defaultCustomRange);

  const input = period === 'custom' ? { period, customRange } : { period };

  const overviewQ = useOperationalOverview(input);
  const occupancyQ = useOccupancyRateReport(input);
  const newVsReturningQ = useNewVsReturningReport(input);

  const isLoading = overviewQ.isLoading || occupancyQ.isLoading || newVsReturningQ.isLoading;
  const isError = overviewQ.isError || occupancyQ.isError || newVsReturningQ.isError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-rose-400">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm">Erro ao carregar relatórios operacionais.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header + Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Operacional</h2>
          <p className="text-sm text-muted-foreground">
            Visão geral de agendamentos, ocupação e clientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodFilter value={period} onChange={setPeriod} />
          {period === 'custom' && (
            <CustomRangePicker value={customRange} onChange={setCustomRange} />
          )}
        </div>
      </div>

      {/* Card 1 — Overview */}
      <div className="rounded-xl border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-medium">Visão Geral</h3>
        </div>
        <div className="p-5">
          <OverviewCards
            data={overviewQ.data}
            isLoading={overviewQ.isLoading}
            isError={overviewQ.isError}
          />
        </div>
      </div>

      {/* Grid 2 colunas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card 2 — Novos vs Recorrentes */}
        <div className="rounded-xl border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-medium">Novos vs Recorrentes</h3>
            <p className="text-xs text-muted-foreground">Clientes novos e recorrentes por mês</p>
          </div>
          <div className="p-5">
            <NewVsReturningChart
              data={newVsReturningQ.data}
              isLoading={newVsReturningQ.isLoading}
              isError={newVsReturningQ.isError}
            />
          </div>
        </div>

        {/* Card 3 — Ocupação */}
        <div className="rounded-xl border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-medium">Ocupação Diária</h3>
            <p className="text-xs text-muted-foreground">% de horários ocupados por dia</p>
          </div>
          <div className="p-5">
            <OccupancyChart
              data={occupancyQ.data}
              isLoading={occupancyQ.isLoading}
              isError={occupancyQ.isError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}