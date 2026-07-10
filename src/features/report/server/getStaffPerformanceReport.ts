// src/features/report/server/getStaffPerformanceReport.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { getPeriodRange } from '../utils/periodRange';
import { calculateStaffOccupancy } from '../utils/calculateStaffOccupancy';
import type { StaffPerformanceRow } from '../types';

const inputSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom']),
  customRange: z.object({ start: z.string(), end: z.string() }).optional(),
});

export const getStaffPerformanceReport = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<StaffPerformanceRow[]> => {
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
      'get_staff_performance_report',
      {
        p_start_date: range.start,
        p_end_date: range.end,
      },
    );

    if (error) throw error;

    return (rows ?? []).map((row: Record<string, unknown>) => ({
      staffId: row.staff_id as string,
      staffName: row.staff_name as string,
      staffColor: (row.staff_color as string | null) ?? null,
      staffAvatarUrl: null, // TODO: add LEFT JOIN profiles.avatar_url in SQL
      revenue: Number(row.revenue),
      commission: Number(row.commission),
      appointmentsCount: Number(row.appointments_count),
      occupancyRate: calculateStaffOccupancy({
        totalBookedMinutes: Number(row.total_booked_minutes),
        workingHours: row.working_hours as Record<string, unknown> | null,
        startDate: range.start,
        endDate: range.end,
      }),
    }));
  });