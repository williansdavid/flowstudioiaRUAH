import type { AppointmentItem, BookableStaffItem } from '../../types';
import { AppointmentBlock } from './AppointmentBlock';
import { calculateTop, calculateHeight, CALENDAR_CONFIG } from '../../utils/calendarUtils';

interface Props {
  staff: BookableStaffItem;
  date: string;
  appointments: AppointmentItem[];
  onAppointmentClick?: (a: AppointmentItem) => void;
  onSlotClick?: (staffId: string, startsAt: string) => void;
}

export function StaffColumn({ staff, date, appointments, onAppointmentClick, onSlotClick }: Props) {
  const handleColumnClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSlotClick) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutesFromStart = y / CALENDAR_CONFIG.PIXELS_PER_MINUTE;
    const totalMinutes = minutesFromStart + (CALENDAR_CONFIG.START_HOUR * 60);
    
    const roundedMinutes = Math.floor(totalMinutes / 15) * 15;
    const hours = Math.floor(roundedMinutes / 60);
    const mins = roundedMinutes % 60;
    
    const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    const isoString = `${date}T${timeString}`;
    
    onSlotClick(staff.id, isoString);
  };

  return (
    <div
      className="relative w-full h-full cursor-pointer hover:bg-slate-800/20 transition-colors"
      onClick={handleColumnClick}
    >
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