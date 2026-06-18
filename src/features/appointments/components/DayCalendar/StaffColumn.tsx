// src/features/appointments/components/DayCalendar/StaffColumn.tsx
import React, { useMemo } from 'react';
import type { AppointmentItem, BookableStaffItem } from '../../types';
import type { DragState } from '../../hooks/useCalendarDrag';
import { DAY_START_HOUR, DAY_END_HOUR, SLOT_HEIGHT, layoutDay } from './geometry';
import { staffColor } from './staffColor';
import { AppointmentBlock } from './AppointmentBlock';

interface Props {
  staff: BookableStaffItem;
  date: string;
  appointments: AppointmentItem[];
  dragState: DragState;
  onAppointmentPointerDown?: (e: React.PointerEvent, appointmentId: string, mode: 'drag' | 'resize') => void;
  onAppointmentClick?: (a: AppointmentItem) => void;
  onSlotClick?: (staffId: string, startsAt: string) => void;
}

export function StaffColumn({
  staff,
  date,
  appointments,
  dragState,
  onAppointmentPointerDown,
  onAppointmentClick,
  onSlotClick,
}: Props) {
  const color = staffColor(staff.id);

  // Janela de tempo padrão da grade (00:00 às 24:00)
  const windowConfig = useMemo(
    () => ({
      startMin: DAY_START_HOUR * 60,
      endMin: DAY_END_HOUR * 60,
    }),
    []
  );

  // Calcula o posicionamento geométrico de overlaps e lanes da coluna
  const positionedBlocks = useMemo(() => {
    const layoutInputs = appointments.map((a) => ({
      appointmentId: a.id,
      staffId: a.staffId,
      startsAt: a.startsAt,
      endsAt: a.endsAt,
    }));
    return layoutDay(layoutInputs, [staff.id], windowConfig);
  }, [appointments, staff.id, windowConfig]);

  // Mapeamento rápido para associar a geometria ao agendamento correspondente
  const blocksMap = useMemo(() => {
    const map = new Map<string, (typeof positionedBlocks)[0]>();
    for (const b of positionedBlocks) {
      map.set(b.appointmentId, b);
    }
    return map;
  }, [positionedBlocks]);

  // Criação dos slots de 15 minutos para detecção de toques (Mobile-First)
  const slots = useMemo(() => {
    const list = [];
    const totalSlots = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / 15;
    for (let i = 0; i < totalSlots; i++) {
      const currentMinutes = DAY_START_HOUR * 60 + i * 15;
      const hours = Math.floor(currentMinutes / 60)
        .toString()
        .padStart(2, '0');
      const mins = (currentMinutes % 60).toString().padStart(2, '0');
      list.push({ timeStr: `${hours}:${mins}`, currentMinutes });
    }
    return list;
  }, []);

  const handleSlotClick = (timeStr: string) => {
    const startsAt = `${date}T${timeStr}:00`;
    onSlotClick?.(staff.id, startsAt);
  };

  return (
    <div className="relative flex-1 min-w-[120px] h-full border-r border-border bg-surface/50">
      {/* Grade de fundo interativa para criação rápida — linhas a cada 30 min */}
      <div className="absolute inset-0 z-0 flex flex-col">
        {slots.map(({ timeStr, currentMinutes }) => (
          <div
            key={timeStr}
            onClick={() => handleSlotClick(timeStr)}
            className={`w-full cursor-pointer hover:bg-primary/5 transition-colors ${
              currentMinutes % 30 === 0 ? 'border-t border-border/20' : ''
            }`}
            style={{ height: SLOT_HEIGHT }}
            role="button"
            aria-label={`Agendar às ${timeStr} com ${staff.name}`}
          />
        ))}
      </div>

      {/* Camada flutuante contendo os blocos de agendamento */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {appointments.map((a) => {
          const block = blocksMap.get(a.id);
          if (!block) return null;

          const widthFraction = 1 / block.laneCount;
          const leftFraction = block.lane / block.laneCount;
          const isDragging = dragState.appointmentId === a.id;

          return (
            <div key={a.id} className="pointer-events-auto">
              <AppointmentBlock
                appointment={a}
                color={color}
                widthFraction={widthFraction}
                leftFraction={leftFraction}
                isDragging={isDragging}
                onPointerDown={(e, appointmentId, mode) => {
                  onAppointmentPointerDown?.(e, appointmentId, mode);
                }}
                onClick={onAppointmentClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}