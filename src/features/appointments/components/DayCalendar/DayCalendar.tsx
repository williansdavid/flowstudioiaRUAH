// src/features/appointments/components/DayCalendar/DayCalendar.tsx
import { useRef, useEffect, useState } from 'react';
import type { AppointmentItem, BookableStaffItem } from '../../types';
import { StaffColumn } from './StaffColumn';
import { CALENDAR_CONFIG } from '../../utils/calendarUtils';

interface Props {
  date: string;
  staff: BookableStaffItem[];
  appointments: AppointmentItem[];
  isToday?: boolean;
  onAppointmentClick?: (a: AppointmentItem) => void;
  onSlotClick?: (staffId: string, startsAt: string) => void;
}

export function DayCalendar({
  date,
  staff,
  appointments,
  isToday = false,
  onAppointmentClick,
  onSlotClick,
}: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<HTMLDivElement>(null);
  const initialScrollDone = useRef(false);
  const [currentTimeTop, setCurrentTimeTop] = useState<number | null>(null);

  const hours = Array.from(
    { length: CALENDAR_CONFIG.END_HOUR - CALENDAR_CONFIG.START_HOUR + 1 },
    (_, i) => CALENDAR_CONFIG.START_HOUR + i
  );

  const totalHeight = (CALENDAR_CONFIG.END_HOUR - CALENDAR_CONFIG.START_HOUR) * 60 * CALENDAR_CONFIG.PIXELS_PER_MINUTE;

  useEffect(() => {
    initialScrollDone.current = false;
  }, [date]);

  useEffect(() => {
    if (!isToday) return;
    
    const updateIndicator = () => {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const offset = minutes - (CALENDAR_CONFIG.START_HOUR * 60);
      
      if (offset >= 0 && offset <= (CALENDAR_CONFIG.END_HOUR - CALENDAR_CONFIG.START_HOUR) * 60) {
        setCurrentTimeTop(offset * CALENDAR_CONFIG.PIXELS_PER_MINUTE);
      } else {
        setCurrentTimeTop(null);
      }
    };
    
    updateIndicator();
    const interval = setInterval(updateIndicator, 60000);
    return () => clearInterval(interval);
  }, [isToday]);

  useEffect(() => {
    if (isToday && currentTimeTop !== null && !initialScrollDone.current) {
      const container = scrollContainerRef.current;
      const anchor = currentTimeRef.current;
      
      if (!container || !anchor) return;

      let attempts = 0;

      const performScroll = () => {
        attempts++;
        if (container.clientHeight > 0 && container.scrollHeight > container.clientHeight) {
          anchor.scrollIntoView({ 
            block: 'center',
            inline: 'nearest'
          });
          initialScrollDone.current = true;
        } else if (attempts < 20) {
          setTimeout(performScroll, 50);
        }
      };

      performScroll();
    }
  }, [isToday, currentTimeTop]);

  const byStaff = new Map<string, AppointmentItem[]>();
  for (const appt of appointments) {
    if (!byStaff.has(appt.staffId)) {
      byStaff.set(appt.staffId, []);
    }
    byStaff.get(appt.staffId)!.push(appt);
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 sm:rounded-2xl border-y sm:border border-slate-800/60 sm:shadow-2xl overflow-hidden">
      
      {/* ÁREA DE SCROLL (O cabeçalho interno foi removido. A grade começa direto aqui) */}
      <div 
        className="flex-1 overflow-auto relative bg-slate-950 snap-x snap-mandatory scroll-pl-8 sm:scroll-pl-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" 
        ref={scrollContainerRef}
      >
        <div className="flex min-w-max">
          
          {/* RÉGUA DE HORÁRIOS */}
          <div className="sticky left-0 z-40 w-8 sm:w-16 flex-shrink-0 border-r border-slate-700/50 bg-slate-950/80 backdrop-blur-xl shadow-[4px_0_24px_-4px_rgba(0,0,0,0.3)]">
            <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-700/50 h-[60px]" />
            <div className="relative mt-4 mb-8" style={{ height: totalHeight }}>
              {hours.map(hour => (
                <div 
                  key={hour} 
                  className="absolute w-full text-right pr-1 sm:pr-3 text-[10px] sm:text-[11px] font-bold text-orange-500 -mt-2 select-none" 
                  style={{ top: (hour - CALENDAR_CONFIG.START_HOUR) * 60 * CALENDAR_CONFIG.PIXELS_PER_MINUTE }}
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
              {isToday && currentTimeTop !== null && (
                <div 
                  ref={currentTimeRef}
                  className="absolute right-0 translate-x-[6px] -translate-y-[6px] w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.8)] ring-2 ring-slate-950 z-50" 
                  style={{ top: currentTimeTop }}
                />
              )}
            </div>
          </div>

          {/* CARDS DOS PROFISSIONAIS */}
          {staff.map(s => {
            const avatarSrc = s.avatarUrl || (s as any).avatar_url;
            
            return (
              <div 
                key={s.id} 
                className="w-[calc(100vw-4rem)] sm:w-[380px] flex-shrink-0 border-r border-slate-700/50 relative snap-start flex flex-col group"
              >
                <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-700/50 p-4 h-[60px] flex items-center justify-center gap-3 transition-colors group-hover:bg-slate-900/50">
                  {avatarSrc ? (
                    <img 
                      src={avatarSrc} 
                      alt={s.name} 
                      className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('fallback-active');
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {avatarSrc && (
                    <div className="hidden fallback-active:flex w-8 h-8 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-xs font-bold text-slate-300">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-slate-200 tracking-wide truncate">{s.name}</span>
                </div>

                <div className="relative mt-4 mb-8" style={{ height: totalHeight }}>
                  <div className="absolute inset-0 pointer-events-none z-0">
                    {hours.map(hour => (
                      <div 
                        key={hour} 
                        className="absolute w-full border-t border-slate-700/60" 
                        style={{ top: (hour - CALENDAR_CONFIG.START_HOUR) * 60 * CALENDAR_CONFIG.PIXELS_PER_MINUTE }} 
                      />
                    ))}
                  </div>
                  {isToday && currentTimeTop !== null && (
                    <div 
                      className="absolute left-0 right-0 border-t border-cyan-500/50 z-20 pointer-events-none" 
                      style={{ top: currentTimeTop }}
                    />
                  )}
                  <div className="absolute inset-0 z-10">
                    <StaffColumn
                      staff={s}
                      date={date}
                      appointments={byStaff.get(s.id) ?? []}
                      onAppointmentClick={onAppointmentClick}
                      onSlotClick={onSlotClick}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}