// src/features/report/server/getOccupancyRateReport.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { getPeriodRange } from '../utils/periodRange';
import { calculateOccupancyRate } from '../utils/calculateOccupancyRate';
import type { OccupancyRateRow } from '../types';

const inputSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom']),
  customRange: z.object({ start: z.string(), end: z.string() }).optional(),
});

export const getOccupancyRateReport = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<OccupancyRateRow[]> => {
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
      'get_occupancy_rate_report',
      {
        p_start_date: range.start,
        p_end_date: range.end,
      },
    );

    if (error) throw error;

    const raw = (rows ?? []).map((row: Record<string, unknown>) => ({
      date: row.date as string,
      filledSlots: Number(row.filled_slots),
      cancellations: Number(row.cancellations),
      noShows: Number(row.no_shows),
      staffWorking: Number(row.staff_working),
    }));

    return calculateOccupancyRate(raw);
  });