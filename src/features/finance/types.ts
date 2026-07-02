export type FinancePeriod = 'today' | 'week' | 'month' | 'custom';

export interface PeriodRange {
  /** YYYY-MM-DD */
  start: string;
  /** YYYY-MM-DD */
  end: string;
}

export interface FinanceKpi {
  value: number;
  /** null quando não há base de comparação (ex: divisão por zero no período anterior) */
  deltaPct: number | null;
}

export interface FinanceSummary {
  revenue: FinanceKpi;
  avgTicket: FinanceKpi;
  appointmentsCount: FinanceKpi;
  expenses: FinanceKpi;
  netBalance: FinanceKpi;
  totalCommission: FinanceKpi;
}

export interface PaymentMethodSlice {
  paymentMethodId: string;
  paymentMethodName: string;
  paymentMethodIcon: string | null;
  amount: number;
  percentage: number;
}

export interface RevenueTrendPoint {
  /** YYYY-MM-DD */
  date: string;
  income: number;
  expense: number;
}

export interface StaffRevenueItem {
  staffId: string;
  staffName: string;
  staffAvatarUrl: string | null;
  staffColor: string | null;
  /** Percentual de comissão do profissional (ex: 70 = 70%) */
  commissionRate: number;
  revenue: number;
  /** revenue * (commissionRate / 100) */
  commission: number;
  appointmentsCount: number;
}

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'service'
  | 'product'
  | 'commission'
  | 'rent'
  | 'utilities'
  | 'supplies'
  | 'marketing'
  | 'salary'
  | 'other';

export interface TransactionItem {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  occurredAt: string;
  paymentMethodName: string | null;
  staffName: string | null;
  referenceId: string | null;
}
