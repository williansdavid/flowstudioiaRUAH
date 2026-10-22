// src/features/dashboard/components/RevenueByStaffChart.tsx
import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Loader2, PieChart as PieIcon } from 'lucide-react';
import { getRevenueByStaff } from '@/features/dashboard/server/getRevenueByStaff';
import type { RevenueByStaffItem } from '@/features/dashboard/types';

// Paleta multicor com contraste real no fundo dark.
const COLORS = [
  '#f59e0b', // amber
  '#10b981', // emerald
  '#6366f1', // indigo
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#eab308', // yellow
  '#f43f5e', // rose
];

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface TooltipPayload {
  payload: RevenueByStaffItem;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0]!.payload;
  return (
    <div className="rounded-lg border border-amber-500/20 bg-zinc-900/95 px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-amber-200">{item.staffName}</p>
      <p className="text-zinc-300">{brl(item.total)}</p>
    </div>
  );
}

interface LegendEntry {
  value: string;
  color?: string;
  payload?: RevenueByStaffItem;
}

function ChartLegend({ payload }: { payload?: LegendEntry[] }) {
  if (!payload?.length) return null;
  return (
    <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {payload.map((entry, i) => (
        <li
          key={entry.payload?.staffId ?? `legend-${i}`}
          className="flex items-center gap-2 text-xs"
        >
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-zinc-400">{entry.value}</span>
          <span className="font-medium text-zinc-200">
            {entry.payload ? brl(entry.payload.total) : ''}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function RevenueByStaffChart() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'revenueByStaff'],
    queryFn: () => getRevenueByStaff(),
  });

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="mb-4 flex items-center gap-2">
        <PieIcon className="h-5 w-5 text-amber-400" />
        <h3 className="text-base font-semibold text-zinc-100">
          Receita por Profissional
        </h3>
        <span className="ml-auto text-xs text-zinc-500">mês corrente</span>
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
            Nenhuma receita registrada neste mês.
          </p>
        </div>
      )}

      {/* Data */}
      {!isLoading && !isError && data && data.length > 0 && (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="staffName"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.staffId ?? `none-${i}`}
                  fill={entry.color}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
              verticalAlign="bottom"
              content={<ChartLegend />}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
