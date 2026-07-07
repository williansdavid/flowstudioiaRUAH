import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import {
  parseWorkingHours,
  type DaySchedule,
  type WeekdayKey,
} from '@/lib/scheduling/workingHours.schema';

/** Granularidade FIXA da grade (decisão #8). */
const SLOT_STEP_MIN = 30;

/** Status que ocupam slot. cancelled/no_show liberam (decisão #10). */
const OCCUPYING_STATUSES = ['pending', 'confirmed', 'completed'] as const;

const inputSchema = z.object({
  staffId: z.string().uuid('Profissional inválido'),
  serviceId: z.string().uuid('Serviço inválido'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  days: z.number().int().min(1).max(31).default(14),
});

export type GetAvailableSlotsInput = z.infer<typeof inputSchema>;

export interface SlotItem {
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
}

export interface DaySlots {
  date: string; // 'YYYY-MM-DD'
  slots: SlotItem[];
}

interface Interval {
  start: number; // epoch ms
  end: number;
}

function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function weekdayIndex(date: string): number {
  const d = new Date(`${date}T12:00:00-03:00`);
  const local = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return local.getUTCDay();
}

function localTimeToMs(date: string, time: string): number {
  return new Date(`${date}T${time}:00-03:00`).getTime();
}

function dayRangeISO(date: string): { start: string; end: string } {
  const start = new Date(`${date}T00:00:00-03:00`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function intersect(a: Interval, b: Interval): Interval | null {
  const start = Math.max(a.start, b.start);
  const end = Math.min(a.end, b.end);
  return end > start ? { start, end } : null;
}

interface BusyRow {
  starts_at: string;
  ends_at: string;
}

interface TimeOffRow {
  starts_at: string;
  ends_at: string;
}

export const getAvailableSlots = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<DaySlots[]> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[appointments] Sessão inválida.');
    }

    // 1. Serviço: duração + validade.
    const { data: service, error: svcError } = await supabase
      .from('services')
      .select('duration_minutes, is_active')
      .eq('id', data.serviceId)
      .single();
    if (svcError || !service) {
      throw new Error('[appointments] Serviço não encontrado.');
    }
    if (!service.is_active) {
      throw new Error('[appointments] Serviço inativo.');
    }
    const durationMs = service.duration_minutes * 60 * 1000;
    const stepMs = SLOT_STEP_MIN * 60 * 1000;

    // 2. Staff: working_hours + bookable.
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('working_hours, is_bookable')
      .eq('id', data.staffId)
      .single();
    if (staffError || !staff) {
      throw new Error('[appointments] Profissional não encontrado.');
    }

    const startDate = data.startDate;
    const endDate = addDays(startDate, data.days);

    const workingHours = staff.is_bookable
      ? parseWorkingHours(staff.working_hours)
      : null;

    if (!workingHours) {
      return buildEmptyRange(startDate, data.days);
    }

    // 3. Range global UTC para queries.
    const rangeStart = dayRangeISO(startDate).start;
    const rangeEnd = dayRangeISO(endDate).start;

    const [busyRes, timeOffRes] = await Promise.all([
      supabase
        .from('appointments')
        .select('starts_at, ends_at')
        .eq('staff_id', data.staffId)
        .gte('starts_at', rangeStart)
        .lt('starts_at', rangeEnd)
        .in('status', OCCUPYING_STATUSES as unknown as string[]),
      supabase
        .from('staff_time_off')
        .select('starts_at, ends_at')
        .eq('staff_id', data.staffId)
        .lt('starts_at', rangeEnd)
        .gt('ends_at', rangeStart),
    ]);

    if (busyRes.error) throw busyRes.error;
    if (timeOffRes.error) throw timeOffRes.error;

    const appointments: Interval[] = (busyRes.data as BusyRow[]).map((r) => ({
      start: new Date(r.starts_at).getTime(),
      end: new Date(r.ends_at).getTime(),
    }));

    const timeOff: Interval[] = (timeOffRes.data as TimeOffRow[]).map((r) => ({
      start: new Date(r.starts_at).getTime(),
      end: new Date(r.ends_at).getTime(),
    }));

    const now = Date.now();
    const result: DaySlots[] = [];

    // 4. Loop por dia do range — APENAS working_hours do profissional.
    for (let i = 0; i < data.days; i++) {
      const date = addDays(startDate, i);
      const wd = weekdayIndex(date);

      const daySchedule: DaySchedule | null =
        workingHours[String(wd) as WeekdayKey];
      if (!daySchedule) {
        result.push({ date, slots: [] });
        continue;
      }

      // Janela base = horário de trabalho do profissional
      const base: Interval = {
        start: localTimeToMs(date, daySchedule.start),
        end: localTimeToMs(date, daySchedule.end),
      };

      // Busy do dia = breaks + time_off + appointments
      const dayBusy: Interval[] = [
        ...daySchedule.breaks.map((b) => ({
          start: localTimeToMs(date, b.start),
          end: localTimeToMs(date, b.end),
        })),
        ...timeOff,
        ...appointments,
      ];

      // 5. Grade fixa 30min
      const slots: SlotItem[] = [];
      for (
        let slotStart = base.start;
        slotStart + durationMs <= base.end;
        slotStart += stepMs
      ) {
        const slotEnd = slotStart + durationMs;

        if (slotStart < now) continue;

        const collides = dayBusy.some(
          (b) => b.start < slotEnd && b.end > slotStart,
        );
        if (collides) continue;

        slots.push({
          startsAt: new Date(slotStart).toISOString(),
          endsAt: new Date(slotEnd).toISOString(),
        });
      }

      result.push({ date, slots });
    }

    return result;
  });

function buildEmptyRange(startDate: string, days: number): DaySlots[] {
  const out: DaySlots[] = [];
  for (let i = 0; i < days; i++) {
    out.push({ date: addDays(startDate, i), slots: [] });
  }
  return out;
}