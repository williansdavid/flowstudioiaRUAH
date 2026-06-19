// src/features/appointments/server/getDayTimeOff.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { WeekdayKey } from '@/lib/scheduling/workingHours.schema';

const inputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
});

export type GetDayTimeOffInput = z.infer<typeof inputSchema>;

export interface TimeOffBlockItem {
  id: string;
  staffId: string;
  startsAt: string; // ISO UTC
  endsAt: string;   // ISO UTC
  reason: string | null;
}

interface TimeOffRow {
  id: string;
  staff_id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
}

interface StaffRow {
  id: string;
  working_hours: Record<string, { start: string; end: string; breaks: { start: string; end: string }[] }> | null;
}

function weekdayIndex(date: string): number {
  return new Date(`${date}T12:00:00-03:00`).getUTCDay();
}

function localTimeToUTC(date: string, time: string): string {
  return new Date(`${date}T${time}:00-03:00`).toISOString();
}

function dayRangeISO(date: string): { start: string; end: string } {
  const start = new Date(`${date}T00:00:00-03:00`);
  const end = new Date(`${date}T23:59:59.999-03:00`);
  return { start: start.toISOString(), end: end.toISOString() };
}

export const getDayTimeOff = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<TimeOffBlockItem[]> => {
    const supabase = createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('[appointments] Sessão inválida.');

    const { start, end } = dayRangeISO(data.date);
    const wd = String(weekdayIndex(data.date)) as WeekdayKey;

    // 1. Time-off avulso da tabela staff_time_off
    const { data: rows, error } = await supabase
      .from('staff_time_off')
      .select('id, staff_id, starts_at, ends_at, reason')
      .lt('starts_at', end)
      .gt('ends_at', start)
      .order('starts_at', { ascending: true });

    if (error) throw error;

    const result: TimeOffBlockItem[] = (rows as TimeOffRow[]).map((r) => ({
      id: r.id,
      staffId: r.staff_id,
      startsAt: r.starts_at,
      endsAt: r.ends_at,
      reason: r.reason,
    }));

    // 2. Breaks recorrentes do working_hours de cada staff
    const { data: staffList, error: staffError } = await supabase
      .from('staff')
      .select('id, working_hours')
      .eq('is_bookable', true);

    if (staffError) throw staffError;

    for (const staff of staffList as StaffRow[]) {
      if (!staff.working_hours) continue;
      const daySchedule = staff.working_hours[wd];
      // ✅ FOLGA FIXA: daySchedule === null → bloqueia o dia inteiro
      if (daySchedule === null) {
        result.push({
          id: `off-${staff.id}-${wd}`,
          staffId: staff.id,
          startsAt: localTimeToUTC(data.date, '00:00'),
          endsAt: localTimeToUTC(data.date, '23:59'),
          reason: 'Folga fixa',
        });
        continue;
      }      
      if (!daySchedule?.breaks?.length) continue;

      for (const [i, brk] of daySchedule.breaks.entries()) {
        result.push({
          id: `recurring-${staff.id}-${wd}-${i}`,
          staffId: staff.id,
          startsAt: localTimeToUTC(data.date, brk.start),
          endsAt: localTimeToUTC(data.date, brk.end),
          reason: 'Almoço',
        });
      }
    }

    return result.sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );
  });