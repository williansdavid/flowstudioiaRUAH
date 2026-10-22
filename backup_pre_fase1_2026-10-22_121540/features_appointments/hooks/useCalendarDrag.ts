// src/features/appointments/hooks/useCalendarDrag.ts
import { useState, useCallback, useRef } from 'react';

export interface DragState {
  mode: 'drag' | 'resize' | null;
  appointmentId: string | null;
  originalStartDate: string | null;
  originalEndDate: string | null;
  newStartDate: string | null;
  newEndDate: string | null;
  staffId: string | null;
  startY: number;
  currentY: number;
}

export interface DragOptions {
  appointments: Array<{
    id: string;
    staffId: string;
    startDate: string;
    endDate: string;
    topPx: (iso: string) => number;
    heightPx: (start: string, end: string) => number;
    yToMinutes: (y: number) => number;
    snapMinutes: (minutes: number) => number;
    isoFromDateAndMinutes: (date: string, minutes: number) => string;
    columnWidth: number;
    columnOffsets: Record<string, number>;
    containerLeft: number;
  }>;
  onUpdate: (id: string, next: { staffId: string; startDate: string; endDate: string }) => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

// ✅ CORREÇÃO: garantir que adjustedDateStr é sempre string
function adjustDateAndMinutes(
  dateStr: string,
  minutes: number
): { dateStr: string; minutes: number } {
  let date = new Date(dateStr + 'T00:00:00Z');
  let adjustedMinutes = minutes;

  while (adjustedMinutes < 0) {
    date.setUTCDate(date.getUTCDate() - 1);
    adjustedMinutes += 1440;
  }

  while (adjustedMinutes >= 1440) {
    date.setUTCDate(date.getUTCDate() + 1);
    adjustedMinutes -= 1440;
  }

  const adjustedDateStr = date.toISOString().split('T')[0] ?? dateStr;
  return { dateStr: adjustedDateStr, minutes: adjustedMinutes };
}

export function useCalendarDrag(options: DragOptions) {
  const [dragState, setDragState] = useState<DragState>({
    mode: null,
    appointmentId: null,
    originalStartDate: null,
    originalEndDate: null,
    newStartDate: null,
    newEndDate: null,
    staffId: null,
    startY: 0,
    currentY: 0,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  const bindPointer = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return;
      containerRef.current = element.closest('[data-calendar-container]') as HTMLDivElement;
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, appointmentId: string, mode: 'drag' | 'resize') => {
      e.preventDefault();
      e.stopPropagation();

      const appointment = options.appointments.find((a) => a.id === appointmentId);
      if (!appointment) return;

      const containerRect = containerRef.current?.getBoundingClientRect() ?? { top: 0 };
      const scrollOffset = options.scrollContainerRef?.current?.scrollTop ?? 0;
      const adjustedStartY = e.clientY - containerRect.top + scrollOffset;

      setDragState({
        mode,
        appointmentId,
        originalStartDate: appointment.startDate,
        originalEndDate: appointment.endDate,
        newStartDate: appointment.startDate,
        newEndDate: appointment.endDate,
        staffId: appointment.staffId,
        startY: adjustedStartY,
        currentY: adjustedStartY,
      });

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const containerRect = containerRef.current?.getBoundingClientRect() ?? { top: 0 };
        const scrollOffset = options.scrollContainerRef?.current?.scrollTop ?? 0;
        const adjustedCurrentY = moveEvent.clientY - containerRect.top + scrollOffset;
        const deltaY = adjustedCurrentY - adjustedStartY;

        const deltaMinutes = appointment.yToMinutes(deltaY);

        setDragState((prev) => {
          if (!prev.originalStartDate || !prev.originalEndDate) return prev;

          const startDate = new Date(prev.originalStartDate);
          const endDate = new Date(prev.originalEndDate);
          const durationMs = endDate.getTime() - startDate.getTime();

          let newStart: Date;
          let newEnd: Date;

          if (mode === 'drag') {
            newStart = new Date(startDate.getTime() + deltaMinutes * 60_000);
            newEnd = new Date(newStart.getTime() + durationMs);
          } else {
            newStart = new Date(prev.originalStartDate);
            newEnd = new Date(endDate.getTime() + deltaMinutes * 60_000);
          }

          const snappedStartMinutes = appointment.snapMinutes(
            newStart.getHours() * 60 + newStart.getMinutes()
          );
          const snappedEndMinutes = appointment.snapMinutes(
            newEnd.getHours() * 60 + newEnd.getMinutes()
          );

          let dateStr = prev.originalStartDate.split('T')[0];
          if (!dateStr) return prev;

          const startAdjustment = adjustDateAndMinutes(dateStr, snappedStartMinutes);
          dateStr = startAdjustment.dateStr;
          const adjustedStartMinutes = startAdjustment.minutes;

          const endAdjustment = adjustDateAndMinutes(dateStr, snappedEndMinutes);
          const adjustedEndMinutes = endAdjustment.minutes;

          const newStartDate = appointment.isoFromDateAndMinutes(dateStr, adjustedStartMinutes);
          const newEndDate = appointment.isoFromDateAndMinutes(dateStr, adjustedEndMinutes);

          return {
            ...prev,
            newStartDate,
            newEndDate,
            currentY: adjustedCurrentY,
          };
        });
      };

      const handlePointerUp = () => {
        setDragState((prev) => {
          if (prev.newStartDate && prev.newEndDate && prev.appointmentId) {
            options.onUpdate(prev.appointmentId, {
              staffId: prev.staffId!,
              startDate: prev.newStartDate,
              endDate: prev.newEndDate,
            });
          }
          return {
            mode: null,
            appointmentId: null,
            originalStartDate: null,
            originalEndDate: null,
            newStartDate: null,
            newEndDate: null,
            staffId: null,
            startY: 0,
            currentY: 0,
          };
        });
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    },
    [options]
  );

  return {
    dragState,
    bindPointer,
    handlePointerDown,
  };
}