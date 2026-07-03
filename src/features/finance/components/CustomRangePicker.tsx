import type { PeriodRange } from '../types';

interface Props {
  value: PeriodRange;
  onChange: (range: PeriodRange) => void;
}

export function CustomRangePicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-700/20 bg-slate-800/40 p-3">
      <label className="flex items-center gap-2 text-xs text-slate-400">
        De
        <input
          type="date"
          value={value.start}
          max={value.end}
          onChange={(e) => onChange({ ...value, start: e.target.value })}
          className="rounded-lg border border-slate-700/30 bg-slate-900/50 px-2 py-1.5 text-sm text-slate-200 outline-none focus:border-orange-500/50"
        />
      </label>
      <label className="flex items-center gap-2 text-xs text-slate-400">
        Até
        <input
          type="date"
          value={value.end}
          min={value.start}
          onChange={(e) => onChange({ ...value, end: e.target.value })}
          className="rounded-lg border border-slate-700/30 bg-slate-900/50 px-2 py-1.5 text-sm text-slate-200 outline-none focus:border-orange-500/50"
        />
      </label>
    </div>
  );
}
