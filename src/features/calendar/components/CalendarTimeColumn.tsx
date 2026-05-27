/**
 * ============================================
 * CalendarTimeColumn
 * ============================================
 *
 * Coluna fixa de horarios do grid (08:00, 08:30, ..., 19:30).
 *
 * - Sticky no eixo X (left: 0) para nao sair da viewport no scroll mobile.
 * - Compartilha o sistema de linhas via CSS Grid template do parent.
 * - Tematizada via tokens CSS (funciona em qualquer skin).
 */

import { generateTimeSlotLabels } from "../constants";

export function CalendarTimeColumn() {
  const labels = generateTimeSlotLabels();

  return (
    <div
      className="sticky left-0 z-20 grid grid-rows-[var(--calendar-grid-rows)] border-r"
      style={{
        backgroundColor: "var(--bg-subtle)",
        borderRightColor: "var(--border-default)",
      }}
    >
      {/* Header alinhado com o header das colunas de conteudo */}
      <div
        className="sticky top-0 z-10 h-12 border-b"
        style={{
          backgroundColor: "var(--bg-subtle)",
          borderBottomColor: "var(--border-default)",
        }}
      />

      {labels.map((label, i) => {
        const isHour = i % 2 === 0; // labels "cheias" (08:00, 09:00...)
        return (
          <div
            key={label}
            className="flex items-start justify-end pr-2 pt-1 text-[11px] tabular-nums"
            style={{
              gridRow: i + 2,
              color: isHour ? "var(--fg-default)" : "var(--fg-subtle)",
              fontWeight: isHour ? 600 : 500,
              opacity: isHour ? 1 : 0.7,
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
