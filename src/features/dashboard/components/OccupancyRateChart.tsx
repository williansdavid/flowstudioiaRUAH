// src/features/dashboard/components/OccupancyRateChart.tsx
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { getOccupancyRateReport } from '@/features/report/server/getOccupancyRateReport';

const dateFmt = (iso: string) => {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-amber-500/20 bg-zinc-900/95 px-3 py-2 text-sm shadow-lg">
      <p className="text-xs text-zinc-400">{label ? dateFmt(label) : ''}</p>
      <p className="font-medium text-amber-200">
        {payload[0]?.value ?? '—'}% ocupação
      </p>
    </div>
  );
}

export function OccupancyRateChart() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['report', 'occupancyRate', 'month'],
    queryFn: () =>
      getOccupancyRateReport({
        data: { period: 'month' },
      }),
  });

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/25">
          <TrendingUp className="h-4 w-4" />
        </span>
        <h3 className="text-base font-semibold text-zinc-100">
          Taxa de Ocupação
        </h3>
        <span className="ml-auto text-xs text-zinc-500">últimos 30 dias</span>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="h-6 w-6 text-zinc-500" />
          <p className="text-sm text-zinc-400">
            Não foi possível carregar os dados.
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-md border border-amber-500/30 px-3 py-1.5 text-sm text-amber-300 transition hover:bg-amber-500/10"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && (!data || data.length === 0) && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-zinc-500">
            Nenhum dado de ocupação no período.
          </p>
        </div>
      )}

      {/* Data */}
      {!isLoading && !isError && data && data.length > 0 && (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="occGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              tickFormatter={dateFmt}
              stroke="#52525b"
              tick={{ fill: '#a1a1aa', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              stroke="#52525b"
              tick={{ fill: '#a1a1aa', fontSize: 11 }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#52525b', strokeDasharray: '3 3' }} />
            <Area
              type="monotone"
              dataKey="occupancyRate"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#occGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b', stroke: '#18181b', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}