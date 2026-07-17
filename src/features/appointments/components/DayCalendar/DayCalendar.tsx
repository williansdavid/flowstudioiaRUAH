// src/features/appointments/components/DayCalendar/DayCalendar.tsx
import { useRef, useEffect, useState, useCallback } from 'react';
import type { AppointmentItem, BookableStaffItem } from '../../types';
import type { TimeOffBlockItem } from '../../server/getDayTimeOff';
import { StaffColumn } from './StaffColumn';
import { staffColor } from './staffColor';
import { CALENDAR_CONFIG } from '../../utils/calendarUtils';

interface Props {
  date: string;
  staff: BookableStaffItem[];
  appointments: AppointmentItem[];
  timeOff: TimeOffBlockItem[];
  isToday?: boolean;
  onAppointmentClick?: (a: AppointmentItem) => void;
  onSlotClick?: (staffId: string, startsAt: string) => void;
}

export function DayCalendar({
  date,
  staff,
  appointments,
  timeOff,
  isToday = false,
  onAppointmentClick,
  onSlotClick,
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<HTMLDivElement>(null);
  const initialScrollDone = useRef(false);
  const [currentTimeTop, setCurrentTimeTop] = useState<number | null>(null);
  const syncing = useRef(false);

  const hours = Array.from(
    { length: CALENDAR_CONFIG.END_HOUR - CALENDAR_CONFIG.START_HOUR + 1 },
    (_, i) => CALENDAR_CONFIG.START_HOUR + i
  );

  const totalHeight =
    (CALENDAR_CONFIG.END_HOUR - CALENDAR_CONFIG.START_HOUR) *
    60 *
    CALENDAR_CONFIG.PIXELS_PER_MINUTE;

  useEffect(() => {
    initialScrollDone.current = false;
  }, [date]);

  useEffect(() => {
    if (!isToday) return;

    const updateIndicator = () => {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const offset = minutes - CALENDAR_CONFIG.START_HOUR * 60;
      if (
        offset >= 0 &&
        offset <=
          (CALENDAR_CONFIG.END_HOUR - CALENDAR_CONFIG.START_HOUR) * 60
      ) {
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
    if (window.innerWidth < 640) return;
    if (isToday && currentTimeTop !== null && !initialScrollDone.current) {
      const container = contentRef.current;
      const anchor = currentTimeRef.current;
      if (!container || !anchor) return;

      let attempts = 0;
      const performScroll = () => {
        attempts++;
        if (
          container.clientHeight > 0 &&
          container.scrollHeight > container.clientHeight
        ) {
          anchor.scrollIntoView({ block: 'center', inline: 'nearest' });
          initialScrollDone.current = true;
        } else if (attempts < 20) {
          setTimeout(performScroll, 50);
        }
      };
      performScroll();
    }
  }, [isToday, currentTimeTop]);

  // Sincroniza scroll horizontal: conteúdo → header
  const onContentScroll = useCallback(() => {
    if (syncing.current || !headerRef.current || !contentRef.current) return;
    syncing.current = true;
    headerRef.current.scrollLeft = contentRef.current.scrollLeft;
    requestAnimationFrame(() => { syncing.current = false; });
  }, []);

  // Sincroniza scroll horizontal: header → conteúdo
  const onHeaderScroll = useCallback(() => {
    if (syncing.current || !headerRef.current || !contentRef.current) return;
    syncing.current = true;
    contentRef.current.scrollLeft = headerRef.current.scrollLeft;
    requestAnimationFrame(() => { syncing.current = false; });
  }, []);

  const byStaff = new Map<string, AppointmentItem[]>();
  for (const appt of appointments) {
    if (!byStaff.has(appt.staffId)) {
      byStaff.set(appt.staffId, []);
    }
    byStaff.get(appt.staffId)!.push(appt);
  }

  return (
    <>
      <style>{`
        @media (max-width: 639px) {
          .agenda-scroll::-webkit-scrollbar { display: none; }
          .agenda-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          .agenda-header-scroll::-webkit-scrollbar { display: none; }
          .agenda-header-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        }
        @media (min-width: 640px) {
          .agenda-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
          .agenda-scroll::-webkit-scrollbar-track { background: transparent; }
          .agenda-scroll::-webkit-scrollbar-thumb {
            background: #f97316; border-radius: 4px;
          }
          .agenda-scroll::-webkit-scrollbar-thumb:hover { background: #ea580c; }
          .agenda-scroll { scrollbar-width: thin; scrollbar-color: #f97316 transparent; }
        }
      `}</style>

      {/* 
        🔥 max-h-dvh + overflow-hidden = o scroll fica DENTRO do componente,
        NÃO no avô/grandparent. O flex-1 pega o espaço disponível mas não
        ultrapassa a viewport.
      */}
      <div className="flex flex-col flex-1 max-h-dvh overflow-hidden bg-slate-950 sm:rounded-2xl border-y sm:border border-slate-800/60 sm:shadow-2xl">
        
        {/* ═══ HEADER FIXO (fora do scroll vertical) ═══ */}
        <div
          ref={headerRef}
          onScroll={onHeaderScroll}
          className="overflow-x-auto overflow-y-hidden flex-shrink-0 agenda-header-scroll"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="flex h-[50px]">
            {/* Espaço reservado da régua (mesma largura) */}
            <div className="sticky left-0 z-40 w-8 sm:w-14 flex-shrink-0 bg-slate-950" />

            {staff.map((s) => {
              const avatarSrc = s.avatarUrl || (s as any).avatar_url;
              const color = s.color ?? staffColor(s.id);

              return (
                <div
                  key={s.id}
                  className="min-w-[120px] flex-1 max-w-[320px] flex items-center justify-center gap-2 p-2.5 bg-slate-950/95 backdrop-blur-xl border-b border-r border-slate-700/50"
                >
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={s.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
                      style={{ boxShadow: `0 0 0 2px ${color}` }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('fallback-active');
                      }}
                    />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`,
                        boxShadow: `0 0 0 2px ${color}`,
                      }}
                    >
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-slate-200 tracking-wide truncate text-sm">
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ CONTEÚDO SCROLLÁVEL (vertical + horizontal) ═══ */}
        {/*
          🔥 min-h-0 é CRÍTICO no flexbox:
          sem ele, o flex child NÃO encolhe abaixo do conteúdo,
          e o overflow-auto nunca dispara — o scroll vai pro avô.
        */}
        <div
          ref={contentRef}
          onScroll={onContentScroll}
          className="flex-1 overflow-auto min-h-0 agenda-scroll"
        >
          <div className="flex items-start">
            {/* ─── RÉGUA DE HORÁRIOS (sticky left) ─── */}
            <div className="sticky left-0 z-30 w-8 sm:w-14 flex-shrink-0 border-r border-slate-700/50 bg-slate-950/80 backdrop-blur-xl shadow-[4px_0_24px_-4px_rgba(0,0,0,0.3)]">
              <div className="relative mt-2 mb-4" style={{ height: totalHeight }}>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full text-right pr-1 sm:pr-2 text-[10px] sm:text-[11px] font-bold -mt-2 select-none"
                    style={{
                      top: (hour - CALENDAR_CONFIG.START_HOUR) * 60 * CALENDAR_CONFIG.PIXELS_PER_MINUTE,
                      color: '#10667C',
                      textShadow: '0 0 8px rgba(16, 102, 124, 0.5)',
                    }}
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

            {/* ─── COLUNAS DOS PROFISSIONAIS ─── */}
            {staff.map((s) => (
              <div
                key={s.id}
                className="min-w-[120px] flex-1 max-w-[320px] border-r border-slate-700/50 relative"
              >
                <div style={{ height: totalHeight }}>
                  {/* Linhas divisórias */}
                  <div className="absolute inset-0 pointer-events-none z-0">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="absolute w-full border-t border-slate-700/60"
                        style={{
                          top: (hour - CALENDAR_CONFIG.START_HOUR) * 60 * CALENDAR_CONFIG.PIXELS_PER_MINUTE,
                        }}
                      />
                    ))}
                  </div>

                  {/* Indicador de horário atual */}
                  {isToday && currentTimeTop !== null && (
                    <div
                      className="absolute left-0 right-0 border-t-2 border-cyan-500/60 z-20 pointer-events-none"
                      style={{ top: currentTimeTop }}
                    />
                  )}

                  {/* Blocos de agendamento */}
                  <div className="relative z-10 h-full">
                    <StaffColumn
                      staff={s}
                      date={date}
                      appointments={byStaff.get(s.id) ?? []}
                      timeOff={timeOff}
                      onAppointmentClick={onAppointmentClick}
                      onSlotClick={onSlotClick}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}