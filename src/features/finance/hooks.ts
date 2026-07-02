import { useQuery } from '@tanstack/react-query';
import { getFinanceSummary } from './server/getFinanceSummary';
import { getRevenueByPaymentMethod } from './server/getRevenueByPaymentMethod';
import { getRevenueTrend } from './server/getRevenueTrend';
import { getRevenueByStaffFinance } from './server/getRevenueByStaff';
import { getRecentTransactions } from './server/getRecentTransactions';
import type { FinancePeriod, PeriodRange } from './types';

interface PeriodInput {
  period: FinancePeriod;
  customRange?: PeriodRange;
}

export function useFinanceSummary(input: PeriodInput) {
  return useQuery({
    queryKey: ['finance', 'summary', input.period, input.customRange],
    queryFn: () => getFinanceSummary({ data: input }),
    staleTime: 30_000,
  });
}

export function useRevenueByPaymentMethod(input: PeriodInput) {
  return useQuery({
    queryKey: ['finance', 'byPaymentMethod', input.period, input.customRange],
    queryFn: () => getRevenueByPaymentMethod({ data: input }),
    staleTime: 30_000,
  });
}

export function useRevenueTrend(input: PeriodInput) {
  return useQuery({
    queryKey: ['finance', 'trend', input.period, input.customRange],
    queryFn: () => getRevenueTrend({ data: input }),
    staleTime: 30_000,
  });
}

export function useRevenueByStaffFinance(input: PeriodInput) {
  return useQuery({
    queryKey: ['finance', 'byStaff', input.period, input.customRange],
    queryFn: () => getRevenueByStaffFinance({ data: input }),
    staleTime: 30_000,
  });
}

export function useRecentTransactions(input: PeriodInput & { limit?: number }) {
  return useQuery({
    queryKey: ['finance', 'transactions', input.period, input.customRange, input.limit],
    queryFn: () => getRecentTransactions({ data: input }),
    staleTime: 15_000,
  });
}
