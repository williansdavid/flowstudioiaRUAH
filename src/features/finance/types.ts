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
  /** Total de comissão vindo de produtos */
  commissionProducts: number;
  /** Total de comissão vindo de serviços */
  commissionServices: number;
  /** Receita gerada com produtos */
  revenueProducts: number;
  /** Receita gerada com serviços */
  revenueServices: number;
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

// ─── Comission settlement (acerto de comissões) ───

/** Resumo por profissional para a tela de acerto */
export interface StaffCommissionSummary {
  staffId: string;
  staffName: string;
  staffColor: string | null;
  staffAvatarUrl: string | null;
  totalRevenue: number;
  totalCommission: number;
  settledCommission: number;
  pendingCommission: number;
  appointmentCount: number;
}

/** Transação individual no extrato do acerto */
export interface CommissionTransaction {
  id: string;
  category: TransactionCategory;
  amount: number;
  commissionValue: number;
  description: string | null;
  occurredAt: string;
  isSettled: boolean;
  settledAt: string | null;
}

/** Input para marcar transações como acertadas */
export interface SettleCommissionInput {
  transactionIds: string[];
}