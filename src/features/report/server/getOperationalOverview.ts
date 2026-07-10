// src/features/report/server/getOperationalOverview.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { getPeriodRange } from '../utils/periodRange';

export interface OperationalOverviewRow {
  totalAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  pendingAppointments: number;
}

const inputSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom']),
  customRange: z.object({ start: z.string(), end: z.string() }).optional(),
});

export const getOperationalOverview = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<OperationalOverviewRow> => {
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
      'get_operational_overview',
      {
        p_start_date: range.start,
        p_end_date: range.end,
      },
    );

    if (error) throw error;

    const row = (rows ?? [])[0] as Record<string, unknown> | undefined;

    return {
      totalAppointments: Number(row?.total_appointments ?? 0),
      confirmedAppointments: Number(row?.confirmed_appointments ?? 0),
      completedAppointments: Number(row?.completed_appointments ?? 0),
      cancelledAppointments: Number(row?.cancelled_appointments ?? 0),
      noShowAppointments: Number(row?.no_show_appointments ?? 0),
      pendingAppointments: Number(row?.pending_appointments ?? 0),
    };
  });