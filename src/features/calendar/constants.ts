/**
 * ============================================
 * Calendar - constantes da janela horaria
 * ============================================
 *
 * Definicoes fixas do MVP:
 *  - Janela: 08:00 -> 20:00 (12 horas operacionais)
 *  - Slot: 30 minutos
 *  - Total: 24 slots por dia (24 linhas no grid)
 *
 * Decisao arquitetural:
 *  - Janela FIXA no MVP — simplifica grid, posicionamento e validacao.
 *  - Configuracao por studio fica como evolucao futura.
 */

export const CALENDAR_DAY_START_HOUR = 8;  // 08:00
export const CALENDAR_DAY_END_HOUR = 20;   // 20:00
export const CALENDAR_SLOT_MINUTES = 30;

/**
 * Total de slots no dia: (20 - 8) * 60 / 30 = 24
 */
export const CALENDAR_SLOTS_PER_DAY =
  ((CALENDAR_DAY_END_HOUR - CALENDAR_DAY_START_HOUR) * 60) /
  CALENDAR_SLOT_MINUTES;

/**
 * Altura visual de cada slot em pixels.
 * Usado pelo CSS Grid via custom property.
 * 56px x 24 = 1344px de altura total — confortavel pra leitura no desktop.
 */
export const CALENDAR_SLOT_HEIGHT_PX = 56;

/**
 * Gera array de labels horarios pra coluna de tempo do grid.
 *
 * @returns ["08:00", "08:30", "09:00", ..., "19:30"]
 */
export function generateTimeSlotLabels(): string[] {
  const labels: string[] = [];
  for (let i = 0; i < CALENDAR_SLOTS_PER_DAY; i++) {
    const totalMinutes = CALENDAR_DAY_START_HOUR * 60 + i * CALENDAR_SLOT_MINUTES;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    labels.push(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    );
  }
  return labels;
}

/**
 * Converte hora local (Date) para indice de slot (0-based).
 *
 * - 08:00 -> 0
 * - 08:30 -> 1
 * - 14:00 -> 12
 * - 19:30 -> 23
 * - 07:00 -> -2 (ANTES da janela — caller decide o que fazer)
 * - 20:30 -> 25 (DEPOIS da janela — caller decide o que fazer)
 *
 * Slots fracionados sao arredondados PARA BAIXO (floor).
 * Ex: 14:45 -> slot 13 (que comeca 14:30).
 *
 * IMPORTANTE: trabalha em horario LOCAL do navegador/servidor.
 * O timezone vem implicito do objeto Date.
 */
export function dateToSlotIndex(date: Date): number {
  const minutesFromMidnight = date.getHours() * 60 + date.getMinutes();
  const minutesFromDayStart =
    minutesFromMidnight - CALENDAR_DAY_START_HOUR * 60;
  return Math.floor(minutesFromDayStart / CALENDAR_SLOT_MINUTES);
}

/**
 * Quantos slots ocupa uma duracao em minutos.
 * Arredondado pra cima (ceil) — se o servico dura 45min, ocupa 2 slots (60min).
 *
 * Minimo: 1 slot (mesmo pra servicos < 30min).
 */
export function durationToSlotCount(durationMinutes: number): number {
  if (durationMinutes <= 0) return 1;
  return Math.max(1, Math.ceil(durationMinutes / CALENDAR_SLOT_MINUTES));
}
