// src/features/report/hooks.ts
import { useQuery } from '@tanstack/react-query';
import { getCashFlowReport } from './server/getCashFlowReport';
import { getExpensesByCategoryReport } from './server/getExpensesByCategoryReport';
import { getCashFlowDailyReport } from './server/getCashFlowDailyReport';
import { getRevenueByServiceReport } from './server/getRevenueByServiceReport';
import { getTopProductsReport } from './server/getTopProductsReport';
import { getStaffPerformanceReport } from './server/getStaffPerformanceReport';
import { getOccupancyRateReport } from './server/getOccupancyRateReport';
import { getNewVsReturningReport } from './server/getNewVsReturningReport';
import { getAppointmentsCount } from './server/getAppointmentsCount';
import { getOperationalOverview } from './server/getOperationalOverview';
import type {
  CashFlowRow,
  CashFlowDailyRow,
  ExpenseByCategoryRow,
  TopServiceRow,
  TopProductRow,
  StaffPerformanceRow,
  OccupancyRateRow,
  OperationalOverviewRow
} from './types';
import type { FinancePeriod, PeriodRange } from '@/features/finance/types';
import type { NewVsReturningRow } from './types';


interface ReportPeriodInput {
  period: FinancePeriod;
  customRange?: PeriodRange;
}

export const reportKeys = {
  cashFlow: (input: ReportPeriodInput) =>
    ['report', 'cashFlow', input.period, input.customRange] as const,
  cashFlowDaily: (input: ReportPeriodInput) =>
    ['report', 'cashFlowDaily', input.period, input.customRange] as const,
  expensesByCategory: (input: ReportPeriodInput) =>
    ['report', 'expensesByCategory', input.period, input.customRange] as const,
  revenueByService: (input: ReportPeriodInput) =>
    ['report', 'revenueByService', input.period, input.customRange] as const,
  topProducts: (input: ReportPeriodInput) =>
    ['report', 'topProducts', input.period, input.customRange] as const,
  staffPerformance: (input: ReportPeriodInput) =>
    ['report', 'staffPerformance', input.period, input.customRange] as const,
  occupancyRate: (input: ReportPeriodInput) =>
    ['report', 'occupancyRate', input.period, input.customRange] as const,
  newVsReturning: (input: ReportPeriodInput) =>
    ['report', 'newVsReturning', input.period, input.customRange] as const,
  appointmentsCount: (input: { start: string; end: string }) =>
    ['report', 'appointmentsCount', input.start, input.end] as const,
  operationalOverview: (input: ReportPeriodInput) =>
    ['report', 'operationalOverview', input.period, input.customRange] as const,

};

export function useCashFlowReport(input: ReportPeriodInput) {
  return useQuery<CashFlowRow[]>({
    queryKey: reportKeys.cashFlow(input),
    queryFn: () => getCashFlowReport({ data: input }),
  });
}

export function useExpensesByCategoryReport(input: ReportPeriodInput) {
  return useQuery<ExpenseByCategoryRow[]>({
    queryKey: reportKeys.expensesByCategory(input),
    queryFn: () => getExpensesByCategoryReport({ data: input }),
  });
}

export function useCashFlowDailyReport(input: ReportPeriodInput) {
  return useQuery<CashFlowDailyRow[]>({
    queryKey: reportKeys.cashFlowDaily(input),
    queryFn: () => getCashFlowDailyReport({ data: input }),
  });
}

export function useRevenueByServiceReport(input: ReportPeriodInput) {
  return useQuery<TopServiceRow[]>({
    queryKey: reportKeys.revenueByService(input),
    queryFn: () => getRevenueByServiceReport({ data: input }),
  });
}

export function useTopProductsReport(input: ReportPeriodInput) {
  return useQuery<TopProductRow[]>({
    queryKey: reportKeys.topProducts(input),
    queryFn: () => getTopProductsReport({ data: input }),
  });
}

export function useStaffPerformanceReport(input: ReportPeriodInput) {
  return useQuery<StaffPerformanceRow[]>({
    queryKey: reportKeys.staffPerformance(input),
    queryFn: () => getStaffPerformanceReport({ data: input }),
  });
}

export function useOccupancyRateReport(input: ReportPeriodInput) {
  return useQuery<OccupancyRateRow[]>({
    queryKey: reportKeys.occupancyRate(input),
    queryFn: () => getOccupancyRateReport({ data: input }),
  });
}

export function useNewVsReturningReport(input: ReportPeriodInput) {
  return useQuery<NewVsReturningRow[]>({
    queryKey: reportKeys.newVsReturning(input),
    queryFn: () => getNewVsReturningReport({ data: input }),
  });
}

export function useAppointmentsCount(start: string, end: string) {
  return useQuery<number>({
    queryKey: reportKeys.appointmentsCount({ start, end }),
    queryFn: () => getAppointmentsCount({ data: { start, end } }),
    enabled: Boolean(start && end),
  });
}

export function useOperationalOverview(input: ReportPeriodInput) {
  return useQuery<OperationalOverviewRow>({
    queryKey: reportKeys.operationalOverview(input),
    queryFn: () => getOperationalOverview({ data: input }),
  });
}