// src/features/appointments/server/getAvailableSlots.ts
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

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * businessHours injetado pelo site (Sistema não importa de sites/).
 * Shape espelha src/sites/<studio>/config/businessHours.ts.
 */
const businessDaySchema = z.discriminatedUnion('open', [
  z.object({ open: z.literal(false) }),
  z.object({
    open: z.literal(true),
    opensAt: z.string().regex(TIME_RE),
    closesAt: z.string().regex(TIME_RE),
  }),
]);

const businessHoursSchema = z.object({
  sunday: businessDaySchema,
  monday: businessDaySchema,
  tuesday: businessDaySchema,
  wednesday: businessDaySchema,
  thursday: businessDaySchema,
  friday: businessDaySchema,
  saturday: businessDaySchema,
});

export type BusinessHoursInput = z.infer<typeof businessHoursSchema>;

const inputSchema = z.object({
  staffId: z.string().uuid('Profissional inválido'),
  serviceId: z.string().uuid('Serviço inválido'),
  // primeiro dia do range, 'YYYY-MM-DD' local UTC-3
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  days: z.number().int().min(1).max(31).default(14),
  businessHours: businessHoursSchema,
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

/** Índice 0..6 (0=domingo) -> nome usado no businessHours. */
const WEEKDAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const satisfies readonly (keyof BusinessHoursInput)[];

/** Soma N dias a 'YYYY-MM-DD' (aritmética em UTC, sem tocar fuso). */
function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Weekday 0..6 (0=domingo) do dia local UTC-3. */
function weekdayIndex(date: string): number {
  const d = new Date(`${date}T12:00:00-03:00`);
  const local = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return local.getUTCDay();
}

/** "HH:MM" local (UTC-3) no dia -> epoch ms. */
function localTimeToMs(date: string, time: string): number {
  return new Date(`${date}T${time}:00-03:00`).getTime();
}

/** Range UTC [00:00, +24h) do dia local UTC-3. */
function dayRangeISO(date: string): { start: string; end: string } {
  const start = new Date(`${date}T00:00:00-03:00`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

/** max(a.start,b.start) .. min(a.end,b.end). null se não há interseção. */
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

    // 1. Serviço: duração (valida bloco contínuo, COND. 3) + validade.
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

    // Vazio cedo: staff não-bookable ou sem grade válida.
    const workingHours = staff.is_bookable
      ? parseWorkingHours(staff.working_hours)
      : null;

    if (!workingHours) {
      return buildEmptyRange(startDate, data.days);
    }

    // 3. Range global UTC para queries (1 query cada, não por dia).
    const rangeStart = dayRangeISO(startDate).start;
    const rangeEnd = dayRangeISO(endDate).start; // 00:00 do dia seguinte ao último

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

    // 4. Loop por dia do range.
    for (let i = 0; i < data.days; i++) {
      const date = addDays(startDate, i);
      const wd = weekdayIndex(date);
      const dayName = WEEKDAY_NAMES[wd]!;

      // businessHours do dia.
      const business = data.businessHours[dayName];
      if (!business.open) {
        result.push({ date, slots: [] });
        continue;
      }

      // working_hours do dia (folga fixa => null).
      const daySchedule: DaySchedule | null =
        workingHours[String(wd) as WeekdayKey];
      if (!daySchedule) {
        result.push({ date, slots: [] });
        continue;
      }

      // Passo 2 da 5.4: janela base = businessHours ∩ working_hours.
      const businessWindow: Interval = {
        start: localTimeToMs(date, business.opensAt),
        end: localTimeToMs(date, business.closesAt),
      };
      const workWindow: Interval = {
        start: localTimeToMs(date, daySchedule.start),
        end: localTimeToMs(date, daySchedule.end),
      };
      const base = intersect(businessWindow, workWindow);
      if (!base) {
        result.push({ date, slots: [] });
        continue;
      }

      // Busy do dia = breaks (almoço) + time_off + appointments.
      const dayBusy: Interval[] = [
        ...daySchedule.breaks.map((b) => ({
          start: localTimeToMs(date, b.start),
          end: localTimeToMs(date, b.end),
        })),
        ...timeOff,
        ...appointments,
      ];

      // 5. Fatia grade fixa 30min; mantém slot se [slot, slot+duração]
      //    cabe na base E não colide com nenhum busy (COND. 3).
      const slots: SlotItem[] = [];
      for (
        let slotStart = base.start;
        slotStart + durationMs <= base.end;
        slotStart += stepMs
      ) {
        const slotEnd = slotStart + durationMs;

        if (slotStart < now) continue; // descarta passado

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

/** Range completo com dias vazios (staff sem grade/não-bookable). */
function buildEmptyRange(startDate: string, days: number): DaySlots[] {
  const out: DaySlots[] = [];
  for (let i = 0; i < days; i++) {
    out.push({ date: addDays(startDate, i), slots: [] });
  }
  return out;
}
