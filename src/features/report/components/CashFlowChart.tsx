// src/features/report/components/CashFlowChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { CashFlowRow, CashFlowDailyRow } from '../types';

/* ─── Accent ─── */
const CARD_CLASS = 'from-blue-500/15 to-blue-500/5 border-blue-500/20' as const;
const ICON_CLASS = 'bg-blue-500/15 text-blue-400' as const;

/* ─── Helpers ─── */
const fmt = (n: number) =>
  `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

interface TooltipPayloadItem {
  name?: string;
  dataKey?: string;
  value?: number;
  payload: CashFlowRow | CashFlowDailyRow;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const a = payload.find((p) => p.dataKey === 'income');
  const b = payload.find((p) => p.dataKey === 'expense');
  return (
    <div className="rounded-lg border border-blue-500/20 bg-zinc-900/95 px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium text-blue-200">{label}</p>
      {a && <p className="text-emerald-400">Receita: {fmt(Number(a.value ?? 0))}</p>}
      {b && <p className="text-red-400">Despesa: {fmt(Number(b.value ?? 0))}</p>}
    </div>
  );
}

interface Props {
  data: (CashFlowRow | CashFlowDailyRow)[];
  mode: 'daily' | 'monthly';
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function CashFlowChart({
  data,
  mode,
  isLoading = false,
  isError = false,
  onRetry,
}: Props) {
  return (
    <div className={cn('rounded-xl border bg-gradient-to-b p-5', CARD_CLASS)}>
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className={cn('rounded-lg p-1.5', ICON_CLASS)}>
          <BarChart3 className="size-4" />
        </div>
        <h3 className="font-semibold text-zinc-100">Fluxo de Caixa</h3>
        <span className="ml-auto text-xs text-zinc-500">
          {mode === 'daily' ? 'Diário' : 'Mensal'}
        </span>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex h-72 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex h-72 flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-sm text-zinc-400">
            Não foi possível carregar os dados.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded-md border border-blue-500/30 px-3 py-1.5 text-sm text-blue-300 transition hover:bg-blue-500/10"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && (!data || data.length === 0) && (
        <div className="flex h-72 items-center justify-center">
          <p className="text-sm text-zinc-500">Nenhum dado no período.</p>
        </div>
      )}

      {/* Data */}
      {!isLoading && !isError && data && data.length > 0 && (
        <>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis
                  dataKey={mode === 'daily' ? 'date' : 'month'}
                  stroke="#52525b"
                  tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  angle={mode === 'daily' ? -45 : 0}
                  textAnchor={mode === 'daily' ? 'end' : 'middle'}
                  height={mode === 'daily' ? 60 : 30}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v: number) =>
                    `R$${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
                  }
                  stroke="#52525b"
                  tick={{ fill: '#a1a1aa', fontSize: 11 }}
                />
                <Tooltip content={<ChartTooltip />} labelFormatter={(label) => label} />
                <Bar
                  dataKey="income"
                  name="Receita"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={mode === 'daily' ? 16 : 48}
                />
                <Bar
                  dataKey="expense"
                  name="Despesa"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={mode === 'daily' ? 16 : 48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Saldo líquido */}
          <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2.5">
            <span className="text-sm text-zinc-400">Saldo líquido</span>
            <span
              className={cn(
                'text-sm font-semibold',
                calcNetBalance(data) >= 0 ? 'text-emerald-400' : 'text-red-400',
              )}
            >
              {fmt(calcNetBalance(data))}
            </span>
          </div>

          {/* Tabela auxiliar (só para mensal) */}
          {mode === 'monthly' && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="pb-2 font-medium">Mês</th>
                    <th className="pb-2 font-medium">Receita</th>
                    <th className="pb-2 font-medium">Despesa</th>
                    <th className="pb-2 font-medium">Saldo</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  {(data as CashFlowRow[]).map((r) => (
                    <tr key={r.month} className="border-b border-zinc-800/60">
                      <td className="py-2">{r.month}</td>
                      <td className="py-2 text-emerald-400">{fmt(r.income)}</td>
                      <td className="py-2 text-red-400">{fmt(r.expense)}</td>
                      <td className="py-2">
                        <span className={r.netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {fmt(r.netBalance)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Utils ─── */
function calcNetBalance(data: (CashFlowRow | CashFlowDailyRow)[]): number {
  return data.reduce((acc, r) => {
    const row = r as CashFlowRow & CashFlowDailyRow;
    return acc + (row.netBalance ?? row.netBalance);
  }, 0);
}