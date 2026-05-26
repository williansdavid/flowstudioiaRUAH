/**
 * ============================================
 * CalendarTimeColumn
 * ============================================
 *
 * Coluna fixa de horarios do grid (08:00, 08:30, ..., 19:30).
 *
 * - Sticky no eixo X (left: 0) para nao sair da viewport no scroll mobile.
 * - Compartilha o sistema de linhas via CSS Grid template do parent.
 */

import { generateTimeSlotLabels } from "../constants";

export function CalendarTimeColumn() {
  const labels = generateTimeSlotLabels();

  return (
    <div className="sticky left-0 z-20 grid grid-rows-[var(--calendar-grid-rows)] border-r border-neutral-200 bg-white">
      {/* Header alinhado com o header das colunas de conteudo */}
      <div className="sticky top-0 z-10 h-12 border-b border-neutral-200 bg-white" />

      {labels.map((label, i) => (
        <div
          key={label}
          className="flex items-start justify-end pr-2 pt-1 text-[11px] font-medium tabular-nums text-neutral-500"
          style={{ gridRow: i + 2 }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
