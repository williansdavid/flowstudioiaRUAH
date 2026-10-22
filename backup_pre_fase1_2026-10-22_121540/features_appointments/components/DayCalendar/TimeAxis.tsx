// src/features/appointments/components/DayCalendar/TimeAxis.tsx
import { GRID_HEIGHT_PX, PX_PER_MINUTE, DAY_START_HOUR, hourLabels } from './geometry';

export function TimeAxis() {
  const labels = hourLabels();

  return (
    <div
      className="relative w-14 shrink-0 select-none border-r border-border"
      style={{ height: GRID_HEIGHT_PX }}
      aria-hidden
    >
      {labels.map(({ hour, label }) => {
        const top = (hour - DAY_START_HOUR) * 60 * PX_PER_MINUTE;
        return (
          <span
            key={hour}
            className="absolute right-1.5 -translate-y-1/2 text-[10px] font-medium tabular-nums text-text-muted"
            style={{ top }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
