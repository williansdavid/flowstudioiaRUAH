// src/features/appointments/components/DayCalendar/geometry.ts

// ── Constantes ──────────────────────────────────────────────────────────

export const DAY_START_HOUR = 6;
export const DAY_END_HOUR = 22;
export const SLOT_HEIGHT = 12; // px por minuto
export const PX_PER_MINUTE = SLOT_HEIGHT;
export const GRID_HEIGHT_PX = (DAY_END_HOUR - DAY_START_HOUR) * 60 * PX_PER_MINUTE;

// ── Helpers de data / hora ──────────────────────────────────────────────

/**
 * ✅ CORREÇÃO: remover dupla conversão de timezone.
 * O ISO já vem com offset "-03:00" correto de isoFromDateAndMinutes().
 * Intl.DateTimeFormat com timeZone causava dupla conversão e agendamento caía no dia anterior.
 *
 * Novo fluxo:
 * 1. ISO recebido: "2026-06-18T22:00:00-03:00" (correto, São Paulo)
 * 2. new Date() interpreta: 2026-06-19 01:00 UTC
 * 3. Converter UTC pra São Paulo: 2026-06-19 01:00 - 3h = 2026-06-18 22:00 ✅
 * 4. Extrair data e hora: "2026-06-18" e "22:00" ✅
 */
export function splitISO(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  
  // Converter UTC pra São Paulo (-3h)
  const dateUTC = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  const yearSP = dateUTC.getUTCFullYear();
  const monthSP = String(dateUTC.getUTCMonth() + 1).padStart(2, '0');
  const daySP = String(dateUTC.getUTCDate()).padStart(2, '0');
  const hourSP = String(dateUTC.getUTCHours()).padStart(2, '0');
  const minuteSP = String(dateUTC.getUTCMinutes()).padStart(2, '0');
  
  return { date: `${yearSP}-${monthSP}-${daySP}`, time: `${hourSP}:${minuteSP}` };
}

/** { date, time } no fuso do studio → ISO com offset -03:00. */
export function joinISO(date: string, time: string): string {
  // Cria Date em horário local (sem offset)
  const d = new Date(`${date}T${time}:00`);
  // Converte pra UTC (+3h, porque São Paulo é UTC-3)
  const utcTime = d.getTime() + 3 * 60 * 60 * 1000;
  return new Date(utcTime).toISOString();
}

/**
 * Calcula pixels desde o topo do dia até o horário do ISO.
 */
export function topPx(iso: string): number {
  const mins = minutesFromMidnight(iso);
  return (mins - DAY_START_HOUR * 60) * PX_PER_MINUTE;
}

/**
 * Calcula altura em pixels entre dois horários ISO.
 */
export function heightPx(startIso: string, endIso: string): number {
  const start = minutesFromMidnight(startIso);
  const end = minutesFromMidnight(endIso);
  return (end - start) * PX_PER_MINUTE;
}

/**
 * Extrai minutos desde meia-noite de um ISO UTC.
 * Usa Intl.DateTimeFormat com timeZone explícito para evitar
 * comportamento diferente entre servidor (UTC) e dev (fuso local).
 */
export function minutesFromMidnight(iso: string): number {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const [hh, mm] = fmt.format(d).split(':');
  return Number(hh) * 60 + Number(mm);
}

/**
 * Gera labels de horas para o eixo Y.
 */
export function hourLabels() {
  const labels = [];
  for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) {
    labels.push({
      hour: h,
      label: `${h.toString().padStart(2, '0')}:00`,
    });
  }
  return labels;
}