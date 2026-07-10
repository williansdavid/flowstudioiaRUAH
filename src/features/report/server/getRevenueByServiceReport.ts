// src/features/report/server/getRevenueByServiceReport.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { getPeriodRange } from '../utils/periodRange';
import type { TopServiceRow } from '../types';

const inputSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom']),
  customRange: z.object({ start: z.string(), end: z.string() }).optional(),
});

export const getRevenueByServiceReport = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<TopServiceRow[]> => {
    const supabase = createSupabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('[report] Sessão inválida.');
    }

    const range = getPeriodRange(data.period, data.customRange);
    const { data: rows, error } = await supabase.rpc(
      'get_revenue_by_service_report',
      {
        p_start_date: range.start,
        p_end_date: range.end,
      },
    );

    if (error) throw error;

    return (rows ?? []).map((row: Record<string, unknown>) => ({
      serviceId: row.service_id as string,
      serviceName: row.service_name as string,
      quantity: Number(row.quantity),
      revenue: Number(row.revenue),
      percentage: Number(row.percentage),
    }));
  });