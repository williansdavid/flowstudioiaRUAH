// src/features/appointments/components/DayCalendar/geometry.ts
export interface GridWindow {
  startMin: number;
  endMin: number;
}

export interface PositionedBlock {
  appointmentId: string;
  columnIndex: number;
  top: number;
  height: number;
  lane: number;
  laneCount: number;
}

export interface LayoutInput {
  appointmentId: string;
  staffId: string;
  startsAt: string;
  endsAt: string;
}

interface Interval extends LayoutInput {
  startMin: number;
  endMin: number;
}

export const SLOT_HEIGHT = 24;
export const DAY_START_HOUR = 0;
export const DAY_END_HOUR = 24;
export const GRID_HEIGHT_PX = (DAY_END_HOUR - DAY_START_HOUR) * (SLOT_HEIGHT * 4);
export const PX_PER_MINUTE = SLOT_HEIGHT / 15;

export function hourLabels() {
  const labels = [];
  for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) {
    labels.push({
      hour: h,
      label: `${h.toString().padStart(2, '0')}:00`,
    });
  }
  return labels;
}

// ✅ CORREÇÃO: usar getHours() e getMinutes() (horário local)
export function minutesFromMidnight(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

export function topPx(iso: string): number {
  const mins = minutesFromMidnight(iso);
  const startMins = DAY_START_HOUR * 60;
  return (mins - startMins) * PX_PER_MINUTE;
}

export function heightPx(startIso: string, endIso: string): number {
  const start = minutesFromMidnight(startIso);
  const end = minutesFromMidnight(endIso);
  return (end - start) * PX_PER_MINUTE;
}

export function yToMinutes(y: number): number {
  const startMins = DAY_START_HOUR * 60;
  return startMins + y / PX_PER_MINUTE;
}

export function snapMinutes(mins: number): number {
  return Math.round(mins / 15) * 15;
}

// ✅ CORREÇÃO: usar setHours() e setMinutes() (horário local)
export function isoFromDateAndMinutes(originalIso: string, totalMinutes: number): string {
  const d = new Date(originalIso);
  d.setHours(Math.floor(totalMinutes / 60));
  d.setMinutes(totalMinutes % 60);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d.toISOString();
}

export function layoutDay(
  items: LayoutInput[],
  staffIds: string[],
  window: GridWindow,
): PositionedBlock[] {
  const columnByStaff = new Map<string, number>();
  staffIds.forEach((id, i) => columnByStaff.set(id, i));
  const result: PositionedBlock[] = [];

  for (const staffId of staffIds) {
    const columnIndex = columnByStaff.get(staffId)!;
    const intervals: Interval[] = items
      .filter((it) => it.staffId === staffId)
      .map((it) => ({
        ...it,
        startMin: minutesFromMidnight(it.startsAt),
        endMin: minutesFromMidnight(it.endsAt),
      }))
      .filter((it) => it.endMin > it.startMin)
      .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

    let group: Interval[] = [];
    let groupMaxEnd = -Infinity;

    const flush = () => {
      if (group.length === 0) return;
      placeGroup(group, columnIndex, window, result);
      group = [];
      groupMaxEnd = -Infinity;
    };

    for (const iv of intervals) {
      if (group.length > 0 && iv.startMin >= groupMaxEnd) flush();
      group.push(iv);
      groupMaxEnd = Math.max(groupMaxEnd, iv.endMin);
    }
    flush();
  }

  return result;
}

function placeGroup(
  group: Interval[],
  columnIndex: number,
  window: GridWindow,
  out: PositionedBlock[],
): void {
  const laneEndMin: number[] = [];
  const laneOf = new Map<string, number>();

  for (const iv of group) {
    let lane = laneEndMin.findIndex((end) => iv.startMin >= end);
    if (lane === -1) {
      lane = laneEndMin.length;
      laneEndMin.push(iv.endMin);
    } else {
      laneEndMin[lane] = iv.endMin;
    }
    laneOf.set(iv.appointmentId, lane);
  }

  const laneCount = laneEndMin.length;
  const startMins = DAY_START_HOUR * 60;

  for (const iv of group) {
    const top = (iv.startMin - startMins) * PX_PER_MINUTE;
    const rawHeight = (iv.endMin - iv.startMin) * PX_PER_MINUTE;
    out.push({
      appointmentId: iv.appointmentId,
      columnIndex,
      top,
      height: Math.max(16, rawHeight),
      lane: laneOf.get(iv.appointmentId)!,
      laneCount,
    });
  }
}