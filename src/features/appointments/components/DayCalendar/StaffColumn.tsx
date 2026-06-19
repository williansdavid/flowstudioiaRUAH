// src/features/appointments/components/DayCalendar/StaffColumn.tsx
import type { AppointmentItem, BookableStaffItem } from '../../types';
import type { TimeOffBlockItem } from '../../server/getDayTimeOff';
import { AppointmentBlock } from './AppointmentBlock';
import { TimeOffBlock } from './TimeOffBlock';
import { staffColor } from './staffColor';
import { calculateTop, calculateHeight, CALENDAR_CONFIG } from '../../utils/calendarUtils';

interface Props {
  staff: BookableStaffItem;
  date: string;
  appointments: AppointmentItem[];
  timeOff: TimeOffBlockItem[];
  onAppointmentClick?: (a: AppointmentItem) => void;
  onSlotClick?: (staffId: string, startsAt: string) => void;
}

export function StaffColumn({
  staff,
  date,
  appointments,
  timeOff,
  onAppointmentClick,
  onSlotClick,
}: Props) {
  const color = staff.color ?? staffColor(staff.id);

  const handleColumnClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSlotClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutesFromStart = y / CALENDAR_CONFIG.PIXELS_PER_MINUTE;
    const totalMinutes = minutesFromStart + CALENDAR_CONFIG.START_HOUR * 60;
    const roundedMinutes = Math.floor(totalMinutes / 15) * 15;
    const hours = Math.floor(roundedMinutes / 60);
    const mins = roundedMinutes % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    const isoString = `${date}T${timeString}`;
    onSlotClick(staff.id, isoString);
  };

  const staffTimeOff = timeOff.filter((to) => to.staffId === staff.id);

  return (
    <div
      className="relative w-full h-full cursor-pointer hover:bg-slate-800/20 transition-colors"
      style={{ borderLeft: `2px solid ${color}` }}
      onClick={handleColumnClick}
    >
      {/* Blocos de folga/intervalo (atrás dos appointments) */}
      {staffTimeOff.map((to) => (
        <TimeOffBlock
          key={to.id}
          startsAt={to.startsAt}
          endsAt={to.endsAt}
          reason={to.reason}
          staffId={staff.id}
          staffColorFromDb={staff.color}
        />
      ))}

      {/* Blocos de agendamento (na frente) */}
      {appointments.map((appt) => (
        <AppointmentBlock
          key={appt.id}
          appointment={appt}
          top={calculateTop(appt.startsAt)}
          height={calculateHeight(appt.startsAt, appt.endsAt)}
          onClick={(e) => {
            e.stopPropagation();
            onAppointmentClick?.(appt);
          }}
        />
      ))}
    </div>
  );
}