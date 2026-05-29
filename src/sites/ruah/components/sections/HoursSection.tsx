/**
 * HoursSection — Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Seção "Horário de Funcionamento" da landing pública.
 *
 * SSR-safe:
 *   - Tabela de horários renderizada SEMPRE (estática, SEO-friendly).
 *   - Badge "Aberto agora" + destaque do dia atual: SOMENTE pós-mount.
 *   - Zero hydration mismatch.
 *
 * Atualização em tempo real:
 *   - Tick a cada 60s para virar status na hora exata.
 *   - Listener `visibilitychange` para recalcular ao voltar pra aba.
 * ----------------------------------------------------------------
 */

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { businessHours } from '@/sites/ruah/config'
import {
  getCurrentStatus,
  getWeekDay,
  formatDayHours,
  DAY_LABELS_LONG,
  WEEK_ORDER_PTBR,
  type HoursStatus,
} from '@/sites/ruah/lib'
import '@/sites/ruah/styles/hours.css'

export function HoursSection() {
  const [mounted, setMounted] = useState(false)
  const [status, setStatus] = useState<HoursStatus | null>(null)
  const [today, setToday] = useState<ReturnType<typeof getWeekDay> | null>(
    null,
  )

  useEffect(() => {
    setMounted(true)

    const tick = () => {
      const now = new Date()
      setStatus(getCurrentStatus(businessHours, now))
      setToday(getWeekDay(now))
    }

    tick()
    const interval = setInterval(tick, 60_000)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <section
      id="horarios"
      className="hours-section"
      aria-labelledby="hours-title"
    >
      <div className="hours-container">
        {/* ── Cabeçalho ─────────────────────────────────────── */}
        <header className="hours-header">
          <span className="hours-eyebrow">Funcionamento</span>
          <h2 id="hours-title" className="hours-title">
            Horário de Atendimento
          </h2>
          <p className="hours-subtitle">
            Atendimento presencial com hora marcada. Agende seu horário pelo
            WhatsApp ou Booksy.
          </p>

          {/* Badge dinâmico — só após mount */}
          {mounted && status && (
            <div
              className={`hours-status-badge ${
                status.isOpen ? '' : 'is-closed'
              }`}
              role="status"
              aria-live="polite"
            >
              <span className="hours-status-dot" aria-hidden="true" />
              <span>{status.label}</span>
            </div>
          )}
        </header>

        {/* ── Tabela de horários ────────────────────────────── */}
        <div className="hours-table" role="list">
          {WEEK_ORDER_PTBR.map((day) => {
            const schedule = businessHours[day]
            const isToday = mounted && today === day
            const isClosedDay = !schedule.open

            return (
              <div
                key={day}
                role="listitem"
                className={`hours-row ${isToday ? 'is-today' : ''}`}
              >
                <span className="hours-day">
                  {isToday && <Clock size={14} aria-hidden="true" />}
                  {DAY_LABELS_LONG[day]}
                  {isToday && (
                    <span className="hours-today-label">Hoje</span>
                  )}
                </span>
                <span
                  className={`hours-time ${
                    isClosedDay ? 'is-closed-day' : ''
                  }`}
                >
                  {formatDayHours(schedule)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
