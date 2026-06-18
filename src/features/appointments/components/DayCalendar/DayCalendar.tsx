// src/features/appointments/components/DayCalendar/DayCalendar.tsx
import { useMemo, useRef, useEffect } from 'react';
import type { AppointmentItem, BookableStaffItem } from '../../types';
import {
  DAY_START_HOUR,
  DAY_END_HOUR,
  SLOT_HEIGHT,
  PX_PER_MINUTE,
  topPx,
  heightPx,
  yToMinutes,
  snapMinutes,
  isoFromDateAndMinutes,
} from './geometry';
import { staffColor } from './staffColor';
import { TimeAxis } from './TimeAxis';
import { StaffColumn } from './StaffColumn';
import { NowLine } from './NowLine';
import { useCalendarDrag } from '../../hooks/useCalendarDrag';

interface Props {
  date: string;
  staff: BookableStaffItem[];
  appointments: AppointmentItem[];
  isToday?: boolean;
  onAppointmentUpdate?: (id: string, next: { staffId: string; startsAt: string; endsAt: string }) => void;
  onAppointmentClick?: (a: AppointmentItem) => void;
  onSlotClick?: (staffId: string, startsAt: string) => void;
}

export function DayCalendar({
  date,
  staff,
  appointments,
  isToday = false,
  onAppointmentUpdate,
  onAppointmentClick,
  onSlotClick,
}: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll automático pra hora atual ao abrir
  useEffect(() => {
    if (!isToday || !scrollContainerRef.current) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const viewportHeight = scrollContainerRef.current.clientHeight;
    const scrollTop = currentMinutes * PX_PER_MINUTE - viewportHeight / 2;

    scrollContainerRef.current.scrollTop = Math.max(0, scrollTop);
  }, [isToday]);

  const dragOptions = useMemo(
    () => ({
      appointments: appointments.map((a) => ({
        id: a.id,
        staffId: a.staffId,
        startDate: a.startsAt,
        endDate: a.endsAt,
        topPx,
        heightPx,
        yToMinutes,
        snapMinutes,
        isoFromDateAndMinutes,
        columnWidth: 120,
        columnOffsets: staff.reduce(
          (acc, s, idx) => {
            acc[s.id] = idx * 120;
            return acc;
          },
          {} as Record<string, number>
        ),
        containerLeft: 0,
      })),
      onUpdate: (id: string, next: { staffId: string; startDate: string; endDate: string }) => {
        onAppointmentUpdate?.(id, {
          staffId: next.staffId,
          startsAt: next.startDate,
          endsAt: next.endDate,
        });
      },
    }),
    [appointments, staff, onAppointmentUpdate]
  );

  const { dragState, bindPointer, handlePointerDown } = useCalendarDrag(dragOptions);

  const byStaff = useMemo(() => {
    const map = new Map<string, AppointmentItem[]>();
    for (const a of appointments) {
      const list = map.get(a.staffId) || [];
      list.push(a);
      map.set(a.staffId, list);
    }
    return map;
  }, [appointments]);

  const gridHeight = (DAY_END_HOUR - DAY_START_HOUR) * (SLOT_HEIGHT * 4);

  const ghostColumnIndex = useMemo(() => {
    if (!dragState.staffId) return -1;
    return staff.findIndex((s) => s.id === dragState.staffId);
  }, [dragState.staffId, staff]);

  if (staff.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface p-5 shadow-md">
        <p className="py-8 text-center text-sm text-text-muted">
          Nenhum profissional disponível para agendamento.
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-card border border-border bg-surface shadow-md select-none"
      data-calendar-container
      ref={bindPointer}
    >
      {/* Cabeçalho sticky */}
      <div className="flex border-b border-border bg-surface-2 sticky top-0 z-30">
        <div className="w-14 shrink-0 border-r border-border" aria-hidden />
        {staff.map((s) => (
          <div
            key={s.id}
            className="flex flex-1 items-center gap-1.5 border-r border-border px-2 py-2 min-w-[120px]"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: staffColor(s.id) }}
            />
            <span
              className="truncate text-xs font-bold tracking-tight"
              style={{ color: staffColor(s.id) }}
            >
              {s.name}
            </span>
          </div>
        ))}
      </div>

      {/* Corpo scrollável */}
      <div
        ref={scrollContainerRef}
        className="overflow-auto touch-pan-y"
        style={{ maxHeight: '70vh' }}
      >
        <div className="relative flex" style={{ height: gridHeight }}>
          <TimeAxis />
          {isToday && (
            <div className="pointer-events-none absolute inset-y-0 left-14 right-0 z-20">
              <NowLine />
            </div>
          )}
          {staff.map((s) => (
            <StaffColumn
              key={s.id}
              staff={s}
              date={date}
              appointments={byStaff.get(s.id) ?? []}
              dragState={dragState}
              onAppointmentPointerDown={handlePointerDown}
              onAppointmentClick={onAppointmentClick}
              onSlotClick={onSlotClick}
            />
          ))}
          {/* Ghost Block (Feedback Visual Fluido e Mobile-First) */}
          {dragState.mode && dragState.newStartDate && dragState.newEndDate && ghostColumnIndex !== -1 && (
            <div
              className="absolute border-2 border-dashed border-primary/50 bg-primary/20 rounded-button pointer-events-none z-40 transition-all duration-75"
              style={{
                top: `${topPx(dragState.newStartDate)}px`,
                height: `${heightPx(dragState.newStartDate, dragState.newEndDate)}px`,
                width: `calc((100% - 56px) / ${staff.length})`,
                left: `calc(56px + (${ghostColumnIndex} * (100% - 56px) / ${staff.length}))`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}