// src/features/report/components/PaymentMethodDonutChart.tsx
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Loader2, PieChart as PieIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { PaymentMethodSlice } from '@/features/finance/types';

const COLORS = [
  '#f59e0b',
  '#10b981',
  '#6366f1',
  '#ec4899',
  '#06b6d4',
  '#eab308',
  '#f43f5e',
];

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface TooltipPayload {
  payload: PaymentMethodSlice;
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
      <p className="font-medium text-amber-200">{item.paymentMethodName}</p>
      <p className="text-zinc-300">{brl(item.amount)}</p>
    </div>
  );
}

interface LegendEntry {
  value: string;
  color?: string;
  payload?: PaymentMethodSlice;
}

function ChartLegend({ payload }: { payload?: LegendEntry[] }) {
  if (!payload?.length) return null;
  return (
    <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {payload.map((entry, i) => (
        <li
          key={entry.payload?.paymentMethodId ?? `legend-${i}`}
          className="flex items-center gap-2 text-xs"
        >
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-zinc-400">{entry.value}</span>
          <span className="font-medium text-zinc-200">
            {entry.payload ? brl(entry.payload.amount) : ''}
          </span>
        </li>
      ))}
    </ul>
  );
}

interface Props {
  data: PaymentMethodSlice[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function PaymentMethodDonutChart({
  data,
  isLoading = false,
  isError = false,
  onRetry,
}: Props) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-gradient-to-b p-5',
        'from-amber-500/15 to-amber-500/5 border-amber-500/20',
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg p-1.5 bg-amber-500/15 text-amber-400">
          <PieIcon className="size-4" />
        </div>
        <h3 className="font-semibold text-zinc-100">
          Receita por Pagamento
        </h3>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-zinc-400">
            Não foi possível carregar os dados.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded-md border border-amber-500/30 px-3 py-1.5 text-sm text-amber-300 transition hover:bg-amber-500/10"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && (!data || data.length === 0) && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-zinc-500">
            Nenhuma receita registrada no período.
          </p>
        </div>
      )}

      {/* Data */}
      {!isLoading && !isError && data && data.length > 0 && (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="paymentMethodName"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.paymentMethodId ?? `none-${i}`}
                  fill={COLORS[i % COLORS.length]}
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