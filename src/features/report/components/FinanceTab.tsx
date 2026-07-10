// src/features/report/components/FinanceTab.tsx
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingDown,
  Wallet,
  Loader2,
  AlertCircle,
  FileDown,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { PeriodFilter } from '@/features/finance/components/PeriodFilter';
import { CustomRangePicker } from '@/features/finance/components/CustomRangePicker';
import { useFinanceSummary, useRevenueByPaymentMethod } from '@/features/finance/hooks';
import { useCashFlowReport, useCashFlowDailyReport, useExpensesByCategoryReport } from '../hooks';
import { getPeriodRange } from '../utils/periodRange';
import { CashFlowChart } from './CashFlowChart';
import { PaymentMethodDonutChart } from './PaymentMethodDonutChart';
import { ExpensesByCategoryDonutChart } from './ExpensesByCategoryDonutChart';
import { FinancePrintView } from './FinancePrintView';
import { useGeneratePdf } from '../hooks/useGeneratePdf';
import type { FinancePeriod, PeriodRange } from '@/features/finance/types';

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

const ICON_WRAPPER = {
  emerald: 'bg-emerald-500/15 text-emerald-400',
  rose: 'bg-rose-500/15 text-rose-400',
  violet: 'bg-violet-500/15 text-violet-400',
  blue: 'bg-blue-500/15 text-blue-400',
  amber: 'bg-amber-500/15 text-amber-400',
  cyan: 'bg-cyan-500/15 text-cyan-400',
};

function fmt(n: number) {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function formatPeriodLabel(period: FinancePeriod, customRange?: PeriodRange): string {
  if (period === 'today') return 'Hoje';
  if (period === 'week') return 'Últimos 7 dias';
  if (period === 'month') return 'Últimos 30 dias';
  if (period === 'custom' && customRange)
    return `${customRange.start} a ${customRange.end}`;
  return '';
}

function defaultCustomRange(): PeriodRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export function FinanceTab() {
  const [period, setPeriod] = useState<FinancePeriod>('month');
  const [customRange, setCustomRange] = useState<PeriodRange>(defaultCustomRange);

  const input = period === 'custom' ? { period, customRange } : { period };

  const isDailyMode = useMemo(() => {
    if (period === 'today' || period === 'week' || period === 'month') return true;
    if (period === 'custom' && customRange) {
      const start = new Date(customRange.start);
      const end = new Date(customRange.end);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return diff <= 31;
    }
    return false;
  }, [period, customRange]);

  // Queries
  const cashFlowQ = useCashFlowReport(input);
  const cashFlowDailyQ = useCashFlowDailyReport(input);
  const expensesQ = useExpensesByCategoryReport(input);
  const summaryQ = useFinanceSummary(input);
  const paymentQ = useRevenueByPaymentMethod(input);

  const activeCashFlowQ = isDailyMode ? cashFlowDailyQ : cashFlowQ;

  const loading =
    activeCashFlowQ.isLoading ||
    expensesQ.isLoading ||
    summaryQ.isLoading ||
    paymentQ.isLoading;

  const error =
    activeCashFlowQ.isError ||
    expensesQ.isError ||
    summaryQ.isError ||
    paymentQ.isError;

  // PDF
  const { printRef, generatePdf, isGenerating } = useGeneratePdf();

  const handleGeneratePdf = async () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    await generatePdf(`relatorio-financeiro-${dateStr}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-500">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>Erro ao carregar relatórios.</p>
      </div>
    );
  }

  const cashFlowData = activeCashFlowQ.data ?? [];
  const expenses = expensesQ.data ?? [];
  const summary = summaryQ.data;
  const payments = paymentQ.data ?? [];

  return (
    <div className="w-full min-w-0 space-y-6 pb-8">
      {/* Header + Filtros + PDF */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-zinc-100">Financeiro</h1>
          <p className="text-sm text-zinc-500">
            Faturamento, despesas e formas de pagamento
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
        <div className="min-w-0">
          <button
            onClick={handleGeneratePdf}
            disabled={isGenerating}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition shadow-sm',
              'border-blue-500 bg-blue-500/20 text-blue-300',
               'hover:bg-blue-500 hover:border-blue-400',
               'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileDown className="size-4" />
            )}
            {isGenerating ? 'Gerando…' : 'PDF'}
          </button> 
        </div>       
      </div>

      {period === 'custom' ? (
        <CustomRangePicker value={customRange} onChange={setCustomRange} />
      ) : null}

      {/* KPIs */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard
            delay={0}
            icon={<DollarSign className="size-4" />}
            label="FATURAMENTO"
            value={fmt(summary.revenue.value)}
            accent="emerald"
          />
          <KpiCard
            delay={0.1}
            icon={<TrendingDown className="size-4" />}
            label="DESPESAS"
            value={fmt(summary.expenses.value)}
            accent="rose"
          />
          <KpiCard
            delay={0.2}
            icon={<Wallet className="size-4" />}
            label="COMISSÕES PAGAS"
            value={fmt(summary.totalCommission.value)}
            accent="violet"
          />
        </div>
      )}

      {/* Fluxo de Caixa */}
      <CashFlowChart
        data={cashFlowData}
        mode={isDailyMode ? 'daily' : 'monthly'}
      />

      {/* Donuts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PaymentMethodDonutChart data={payments} />
        <ExpensesByCategoryDonutChart data={expenses} />
      </div>

      {/* ═══ Print View oculto para gerar o PDF ═══ */}
      <div className="fixed" style={{ left: '-9999px', top: 0, opacity: 0, pointerEvents: 'none', zIndex: -50 }}>
        <FinancePrintView
          ref={printRef}
          cashFlowData={cashFlowData}
          paymentsData={payments}
          expensesData={expenses}
          revenue={summary?.revenue.value ?? 0}
          expenses={summary?.expenses.value ?? 0}
          totalCommission={summary?.totalCommission.value ?? 0}
          periodLabel={formatPeriodLabel(period, customRange)}
          generatedAt={new Date().toLocaleString('pt-BR')}
          mode={isDailyMode ? 'daily' : 'monthly'}
        />
      </div>
    </div>
  );
}

// ── Subcomponentes ──────────────────────────────────────────────

function KpiCard({
  delay,
  icon,
  label,
  value,
  accent,
}: {
  delay: number;
  icon: React.ReactNode;
  label: string;
  value: string;
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
        <span className="text-2xl font-bold text-slate-100">{value}</span>
        <div className={cn('rounded-lg p-2', ICON_WRAPPER[accent])}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}