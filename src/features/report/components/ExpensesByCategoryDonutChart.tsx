// src/features/report/components/ExpensesByCategoryDonutChart.tsx
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
import type { ExpenseByCategoryRow } from '../types';

// Cores semânticas por categoria
const CATEGORY_COLORS: Record<string, string> = {
  rent: '#3b82f6',
  utilities: '#10b981',
  supplies: '#f59e0b',
  marketing: '#ef4444',
  salary: '#8b5cf6',
  commission: '#ec4899',
  other: '#6b7280',
};

const LABELS: Record<string, string> = {
  rent: 'Aluguel',
  utilities: 'Contas',
  supplies: 'Insumos',
  marketing: 'Marketing',
  salary: 'Salários',
  commission: 'Comissões',
  other: 'Outros',
};

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface TooltipPayload {
  payload: ExpenseByCategoryRow;
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
      <p className="font-medium text-amber-200">
        {LABELS[item.category] ?? item.category}
      </p>
      <p className="text-zinc-300">{brl(item.total)}</p>
      <p className="text-zinc-500">{item.percentage}%</p>
    </div>
  );
}

interface LegendEntry {
  value: string;
  color?: string;
  payload?: ExpenseByCategoryRow;
}

function ChartLegend({ payload }: { payload?: LegendEntry[] }) {
  if (!payload?.length) return null;
  return (
    <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {payload.map((entry, i) => (
        <li
          key={entry.payload?.category ?? `legend-${i}`}
          className="flex items-center gap-2 text-xs"
        >
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-zinc-400">{LABELS[entry.value] ?? entry.value}</span>
          <span className="font-medium text-zinc-200">
            {entry.payload ? brl(entry.payload.total) : ''}
          </span>
        </li>
      ))}
    </ul>
  );
}

interface Props {
  data: ExpenseByCategoryRow[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function ExpensesByCategoryDonutChart({
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
          Despesas por Categoria
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
            Nenhuma despesa registrada no período.
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
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.category ?? `none-${i}`}
                  fill={CATEGORY_COLORS[entry.category] ?? '#6b7280'}
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