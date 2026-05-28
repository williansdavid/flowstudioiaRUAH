import { Star, ArrowUpRight } from 'lucide-react'
import { content, useReveal } from '@/sites/ruah'
import type { Testimonial } from '@/sites/ruah/types'

/**
 * TestimonialsSection — Depoimentos reais (Booksy)
 * ----------------------------------------------------------------
 * - Layout: Grid estático 2x2 (desktop) / 1 coluna (mobile)
 * - Avatar: Inicial estilizada em gradiente accent
 * - Prova social agregada: ★ 5.0 · 61 avaliações · 100% recomendam
 * - Link externo Booksy no rodapé
 * - Zero JS — SSR puro, hydration-safe
 * - Guard pattern: se content.testimonials ausente → não renderiza
 * ----------------------------------------------------------------
 */

const BOOKSY_URL =
  'https://booksy.com/pt-br/339118_ruah-barber-lounge_barbearias_887298_botucatu'

const TOTAL_REVIEWS = 61
const AVERAGE_RATING = '5.0'

export function TestimonialsSection() {
  const testimonials = content.testimonials

  // Guard: section opcional
  if (!testimonials || !testimonials.items || testimonials.items.length === 0) {
    return null
  }

  const { eyebrow, title, subtitle, items } = testimonials

  const headerRef = useReveal<HTMLDivElement>()
  const proofRef = useReveal<HTMLDivElement>()
  const gridRef = useReveal<HTMLDivElement>()
  const footerRef = useReveal<HTMLDivElement>()

  return (
    <section
      id="testimonials"
      className="testimonials-section"
      aria-labelledby="testimonials-title"
    >
      <div className="testimonials-container">
        {/* Header */}
        <div ref={headerRef} className="testimonials-header">
          {eyebrow && <span className="testimonials-eyebrow">{eyebrow}</span>}
          <h2 id="testimonials-title" className="testimonials-title">
            {title}
          </h2>
          {subtitle && <p className="testimonials-subtitle">{subtitle}</p>}
        </div>

        {/* Social Proof Badges */}
        <div
          ref={proofRef}
          className="testimonials-proof"
          aria-label="Prova social agregada"
        >
          <span className="testimonials-proof-badge">
            <span
              className="testimonials-proof-stars"
              aria-label={`${AVERAGE_RATING} de 5 estrelas`}
            >
              ★★★★★
            </span>
            <strong>{AVERAGE_RATING}</strong>
          </span>
          <span className="testimonials-proof-badge">
            <strong>{TOTAL_REVIEWS}</strong> avaliações
          </span>
          <span className="testimonials-proof-badge">
            <strong>100%</strong> recomendam
          </span>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="testimonials-grid">
          {items.map((item) => (
            <TestimonialCard key={item.id} testimonial={item} />
          ))}
        </div>

        {/* Footer — Booksy Link */}
        <div ref={footerRef} className="testimonials-footer">
          <a
            href={BOOKSY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="testimonials-booksy-link"
            aria-label="Ver todas as avaliações no Booksy (abre em nova aba)"
          >
            Ver todas as avaliações
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────── */
/* TestimonialCard — Card individual                            */
/* ─────────────────────────────────────────────────────────── */
interface TestimonialCardProps {
  testimonial: Testimonial
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const { name, quote, rating, context } = testimonial
  const initial = name.charAt(0).toUpperCase()

  return (
    <article className="testimonial-card">
      {/* Rating stars */}
      {rating && (
        <div
          className="testimonial-rating"
          aria-label={`${rating} de 5 estrelas`}
        >
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} aria-hidden="true" />
          ))}
        </div>
      )}

      {/* Quote */}
      <blockquote className="testimonial-quote">
        <p>"{quote}"</p>
      </blockquote>

      {/* Author */}
      <div className="testimonial-author">
        <div className="testimonial-avatar" aria-hidden="true">
          {initial}
        </div>
        <div className="testimonial-author-info">
          <span className="testimonial-author-name">{name}</span>
          {context && (
            <span className="testimonial-author-context">{context}</span>
          )}
        </div>
      </div>
    </article>
  )
}
