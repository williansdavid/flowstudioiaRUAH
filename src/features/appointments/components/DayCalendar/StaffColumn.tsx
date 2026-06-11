// src/features/appointments/components/DayCalendar/StaffColumn.tsx
import type { AppointmentItem, BookableStaffItem } from '../../types';
import {
  GRID_HEIGHT_PX,
  SLOT_HEIGHT_PX,
  PX_PER_MINUTE,
  DAY_START_HOUR,
  DAY_END_HOUR,
  minutesFromMidnight,
} from './geometry';
import { staffColor } from './staffColor';
import { AppointmentBlock } from './AppointmentBlock';

interface Layout {
  appointment: AppointmentItem;
  widthFraction: number;
  leftFraction: number;
}

/**
 * Cálculo de overlap por "colunas de empacotamento".
 * Eventos que se cruzam no tempo dividem a largura igualmente.
 */
function layoutOverlaps(items: AppointmentItem[]): Layout[] {
  const sorted = [...items].sort(
    (a, b) => minutesFromMidnight(a.startsAt) - minutesFromMidnight(b.startsAt),
  );

  // Agrupa em clusters de eventos que se sobrepõem em cadeia.
  const clusters: AppointmentItem[][] = [];
  let current: AppointmentItem[] = [];
  let clusterEnd = -1;

  for (const a of sorted) {
    const start = minutesFromMidnight(a.startsAt);
    const end = minutesFromMidnight(a.endsAt);
    if (current.length > 0 && start < clusterEnd) {
      current.push(a);
      clusterEnd = Math.max(clusterEnd, end);
    } else {
      if (current.length > 0) clusters.push(current);
      current = [a];
      clusterEnd = end;
    }
  }
  if (current.length > 0) clusters.push(current);

  const result: Layout[] = [];
  for (const cluster of clusters) {
    // Aloca cada evento à primeira "lane" livre.
    const laneEnds: number[] = [];
    const laneOf = new Map<string, number>();
    for (const a of cluster) {
      const start = minutesFromMidnight(a.startsAt);
      const end = minutesFromMidnight(a.endsAt);
      let lane = laneEnds.findIndex((e) => e <= start);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(end);
      } else {
        laneEnds[lane] = end;
      }
      laneOf.set(a.id, lane);
    }
    const lanes = laneEnds.length;
    for (const a of cluster) {
      const lane = laneOf.get(a.id)!;
      result.push({
        appointment: a,
        widthFraction: 1 / lanes,
        leftFraction: lane / lanes,
      });
    }
  }
  return result;
}

interface Props {
  staff: BookableStaffItem;
  appointments: AppointmentItem[];
  onAppointmentClick?: (a: AppointmentItem) => void;
}

export function StaffColumn({ staff, appointments, onAppointmentClick }: Props) {
  const color = staffColor(staff.id);
  const layouts = layoutOverlaps(appointments);

  // Linhas de grade (a cada slot de 15min).
  const slotCount = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / 15;

  return (
    <div
      className="relative flex-1 border-r border-border"
      style={{ height: GRID_HEIGHT_PX, minWidth: 120 }}
    >
      {/* Linhas de grade */}
      {Array.from({ length: slotCount + 1 }, (_, i) => {
        const isHour = (i * 15) % 60 === 0;
        return (
          <div
            key={i}
            className={`absolute inset-x-0 border-t ${isHour ? 'border-border' : 'border-border/40'}`}
            style={{ top: i * SLOT_HEIGHT_PX }}
            aria-hidden
          />
        );
      })}

      {/* Blocos */}
      {layouts.map(({ appointment, widthFraction, leftFraction }) => (
        <AppointmentBlock
          key={appointment.id}
          appointment={appointment}
          color={color}
          widthFraction={widthFraction}
          leftFraction={leftFraction}
          onClick={onAppointmentClick}
        />
      ))}
    </div>
  );
}
