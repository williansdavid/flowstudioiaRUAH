import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { PeriodFilter } from './PeriodFilter';
import { CustomRangePicker } from './CustomRangePicker';
import { FinanceKpiGrid } from './FinanceKpiGrid';
import { PaymentMethodDonutChart } from './PaymentMethodDonutChart';
import { RevenueTrendChart } from './RevenueTrendChart';
import { RevenueByStaffList } from './RevenueByStaffList';
import { CommissionChart } from './CommissionChart';
import { RecentTransactionsList } from './RecentTransactionsList';
import { NewExpenseButton } from './NewExpenseButton';
import {
  useFinanceSummary,
  useRevenueByPaymentMethod,
  useRevenueTrend,
  useRevenueByStaffFinance,
  useRecentTransactions,
} from '../hooks';
import type { FinancePeriod, PeriodRange } from '../types';

function defaultCustomRange(): PeriodRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export function FinancePage() {
  const [period, setPeriod] = useState<FinancePeriod>('month');
  // Sempre inicializado com um intervalo válido — nunca undefined quando period === 'custom'.
  const [customRange, setCustomRange] = useState<PeriodRange>(defaultCustomRange);

  const input = period === 'custom' ? { period, customRange } : { period };

  const summaryQuery = useFinanceSummary(input);
  const paymentMethodQuery = useRevenueByPaymentMethod(input);
  const trendQuery = useRevenueTrend(input);
  const staffQuery = useRevenueByStaffFinance(input);
  const transactionsQuery = useRecentTransactions({ ...input, limit: 20 });

  const isLoading =
    summaryQuery.isLoading ||
    paymentMethodQuery.isLoading ||
    trendQuery.isLoading ||
    staffQuery.isLoading ||
    transactionsQuery.isLoading;

  const hasError =
    summaryQuery.isError ||
    paymentMethodQuery.isError ||
    trendQuery.isError ||
    staffQuery.isError ||
    transactionsQuery.isError;

  return (
    <div className="w-full min-w-0 space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-100">Financeiro</h1>
          <p className="text-sm text-slate-500">Faturamento, despesas e formas de pagamento</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodFilter value={period} onChange={setPeriod} />
          <NewExpenseButton />
        </div>
      </div>

      {period === 'custom' ? (
        <CustomRangePicker value={customRange} onChange={setCustomRange} />
      ) : null}

      {hasError ? (
        <div className="flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p>Não foi possível carregar os dados financeiros.</p>
            <p className="mt-1 text-xs text-red-400/70">
              {[summaryQuery, paymentMethodQuery, trendQuery, staffQuery, transactionsQuery]
                .map((q) => {
                  if (!q.error) return null;
                  const err = q.error as { message?: string } | Error;
                  return typeof err === 'object' && err !== null && 'message' in err
                    ? err.message
                    : String(err);
                })
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex h-64 items-center justify-center text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        </div>
      ) : (
        <>
          {summaryQuery.data ? <FinanceKpiGrid summary={summaryQuery.data} /> : null}

          <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="min-w-0 xl:col-span-2">
              {trendQuery.data ? <RevenueTrendChart data={trendQuery.data} /> : null}
            </div>
            <div className="min-w-0">
              {paymentMethodQuery.data ? <PaymentMethodDonutChart data={paymentMethodQuery.data} /> : null}
            </div>
          </div>

          <div className="min-w-0">
            {staffQuery.data ? <CommissionChart items={staffQuery.data} /> : null}
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="min-w-0">
              {staffQuery.data ? <RevenueByStaffList items={staffQuery.data} /> : null}
            </div>
            <div className="min-w-0">
              {transactionsQuery.data ? (
                <RecentTransactionsList transactions={transactionsQuery.data} />
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
