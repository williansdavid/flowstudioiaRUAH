// src/features/report/components/FinancePrintView.tsx
import { forwardRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { CashFlowRow, CashFlowDailyRow, ExpenseByCategoryRow } from '../types';
import type { PaymentMethodSlice } from '@/features/finance/types';

/* ─── Props ─── */
interface FinancePrintViewProps {
  cashFlowData: (CashFlowRow | CashFlowDailyRow)[];
  paymentsData: PaymentMethodSlice[];
  expensesData: ExpenseByCategoryRow[];
  revenue: number;
  expenses: number;
  totalCommission: number;
  periodLabel: string;
  generatedAt: string;
  mode: 'daily' | 'monthly';
}

/* ─── Constantes ─── */
const PAYMENT_COLORS = [
  '#f59e0b',
  '#10b981',
  '#6366f1',
  '#ec4899',
  '#06b6d4',
];

const EXPENSE_COLORS: Record<string, string> = {
  rent: '#3b82f6',
  utilities: '#10b981',
  supplies: '#f59e0b',
  marketing: '#ef4444',
  salary: '#8b5cf6',
  commission: '#ec4899',
  other: '#6b7280',
};

const EXPENSE_LABELS: Record<string, string> = {
  rent: 'Aluguel',
  utilities: 'Contas',
  supplies: 'Insumos',
  marketing: 'Marketing',
  salary: 'Salários',
  commission: 'Comissões',
  other: 'Outros',
};

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/* ─── Componente ─── */
export const FinancePrintView = forwardRef<
  HTMLDivElement,
  FinancePrintViewProps
>(function FinancePrintView(props, ref) {
  const {
    cashFlowData,
    paymentsData,
    expensesData,
    revenue,
    expenses,
    totalCommission,
    periodLabel,
    generatedAt,
    mode,
  } = props;

  return (
    <div
      ref={ref}
      style={{
        width: '794px',
        padding: '40px 48px 32px',
        background: '#ffffff',
        color: '#1a1a2e',
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '12px',
        lineHeight: 1.5,
      }}
    >
      {/* ═══ HEADER ═══ */}
      <div
        style={{
          borderBottom: '3px solid #1a1a2e',
          paddingBottom: 16,
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>
          FlowStudio AI
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginTop: 4,
            color: '#374151',
          }}
        >
          Relatório Financeiro
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 8,
            fontSize: 11,
            color: '#6b7280',
          }}
        >
          <span>Período: {periodLabel}</span>
          <span>Gerado em: {generatedAt}</span>
        </div>
      </div>

      {/* ═══ KPIs ═══ */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <KpiBlock label="Faturamento" value={brl(revenue)} color="#059669" />
        <KpiBlock label="Despesas" value={brl(expenses)} color="#dc2626" />
        <KpiBlock
          label="Comissões Pagas"
          value={brl(totalCommission)}
          color="#7c3aed"
        />
      </div>

      {/* ═══ FLUXO DE CAIXA ═══ */}
      {cashFlowData.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 12,
              color: '#1a1a2e',
            }}
          >
            Fluxo de Caixa
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <XAxis
                  dataKey={mode === 'daily' ? 'date' : 'month'}
                  tick={{ fontSize: 10, fill: '#374151' }}
                  angle={mode === 'daily' ? -45 : 0}
                  textAnchor={mode === 'daily' ? 'end' : 'middle'}
                  height={mode === 'daily' ? 50 : 24}
                />
                <YAxis tick={{ fontSize: 10, fill: '#374151' }} />
                <Bar
                  dataKey="income"
                  fill="#10b981"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={mode === 'daily' ? 12 : 40}
                />
                <Bar
                  dataKey="expense"
                  fill="#ef4444"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={mode === 'daily' ? 12 : 40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 16,
              marginTop: 8,
              fontSize: 10,
              color: '#6b7280',
            }}
          >
            <span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>■</span>{' '}
              Receita
            </span>
            <span>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>■</span>{' '}
              Despesa
            </span>
          </div>
        </div>
      )}

      {/* ═══ DONUTS ═══ */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          marginBottom: 24,
        }}
      >
        {/* Receita por Pagamento */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 12,
              color: '#1a1a2e',
            }}
          >
            Receita por Pagamento
          </div>
          {paymentsData.length > 0 ? (
            <>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentsData}
                      dataKey="amount"
                      nameKey="paymentMethodName"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      stroke="none"
                    >
                      {paymentsData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={
                            PAYMENT_COLORS[i % PAYMENT_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px 12px',
                  justifyContent: 'center',
                  marginTop: 8,
                }}
              >
                {paymentsData.map((d, i) => (
                  <span
                    key={d.paymentMethodId}
                    style={{ fontSize: 10, color: '#374151' }}
                  >
                    <span
                      style={{
                        color:
                          PAYMENT_COLORS[i % PAYMENT_COLORS.length],
                      }}
                    >
                      ●
                    </span>{' '}
                    {d.paymentMethodName}: {brl(d.amount)}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: 11,
              }}
            >
              Nenhum dado no período.
            </div>
          )}
        </div>

        {/* Despesas por Categoria */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 12,
              color: '#1a1a2e',
            }}
          >
            Despesas por Categoria
          </div>
          {expensesData.length > 0 ? (
            <>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesData}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      stroke="none"
                    >
                      {expensesData.map((d) => (
                        <Cell
                          key={d.category}
                          fill={
                            EXPENSE_COLORS[d.category] ?? '#6b7280'
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px 12px',
                  justifyContent: 'center',
                  marginTop: 8,
                }}
              >
                {expensesData.map((d) => (
                  <span
                    key={d.category}
                    style={{ fontSize: 10, color: '#374151' }}
                  >
                    <span
                      style={{
                        color:
                          EXPENSE_COLORS[d.category] ?? '#6b7280',
                      }}
                    >
                      ●
                    </span>{' '}
                    {EXPENSE_LABELS[d.category] ?? d.category}: {brl(d.total)}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: 11,
              }}
            >
              Nenhum dado no período.
            </div>
          )}
        </div>
      </div>

      {/* ═══ TABELA ═══ */}
      {cashFlowData.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 12,
              color: '#1a1a2e',
            }}
          >
            Detalhamento — Fluxo de Caixa
          </div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 11,
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid #d1d5db' }}>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '6px 8px',
                    color: '#374151',
                  }}
                >
                  {mode === 'daily' ? 'Data' : 'Mês'}
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '6px 8px',
                    color: '#374151',
                  }}
                >
                  Receita
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '6px 8px',
                    color: '#374151',
                  }}
                >
                  Despesa
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '6px 8px',
                    color: '#374151',
                  }}
                >
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody>
              {cashFlowData.map((row) => {
                const label =
                  mode === 'daily'
                    ? (row as CashFlowDailyRow).date
                    : (row as CashFlowRow).month;
                return (
                  <tr
                    key={label}
                    style={{ borderBottom: '1px solid #e5e7eb' }}
                  >
                    <td
                      style={{
                        padding: '5px 8px',
                        color: '#374151',
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{
                        padding: '5px 8px',
                        textAlign: 'right',
                        color: '#059669',
                      }}
                    >
                      {brl(row.income)}
                    </td>
                    <td
                      style={{
                        padding: '5px 8px',
                        textAlign: 'right',
                        color: '#dc2626',
                      }}
                    >
                      {brl(row.expense)}
                    </td>
                    <td
                      style={{
                        padding: '5px 8px',
                        textAlign: 'right',
                        color:
                          row.netBalance >= 0 ? '#059669' : '#dc2626',
                      }}
                    >
                      {brl(row.netBalance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <div
        style={{
          borderTop: '2px solid #d1d5db',
          paddingTop: 12,
          fontSize: 10,
          color: '#9ca3af',
          textAlign: 'center',
        }}
      >
        FlowStudio AI — Relatório Financeiro — Gerado em {generatedAt}
      </div>
    </div>
  );
});

/* ─── Subcomponente KPI ─── */
function KpiBlock({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        border: `1px solid ${color}33`,
        borderRadius: 8,
        padding: '12px 16px',
        background: `${color}08`,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color,
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}