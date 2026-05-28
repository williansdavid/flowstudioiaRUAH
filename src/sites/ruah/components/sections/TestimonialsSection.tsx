import { Star, ArrowUpRight } from 'lucide-react'
import { content, useReveal } from '@/sites/ruah'
import type { Testimonial } from '@/sites/ruah/types'

/**
 * TestimonialsSection — Depoimentos reais (Booksy + Google)
 * ----------------------------------------------------------------
 * - Layout: Grid 2x2 (desktop) / 1 coluna (mobile)
 * - Avatar: inicial em gradiente accent
 * - Badge de origem (Booksy / Google) + data no rodapé do card
 * - Prova social agregada: ★ 5.0 · 61 avaliações · 100% recomendam
 * - Link externo → Google Reviews (fonte: content.externalLinks)
 * - Zero JS — SSR puro, hydration-safe
 * - Guard pattern: se content.testimonials ausente → não renderiza
 * ----------------------------------------------------------------
 */

const TOTAL_REVIEWS = 61
const AVERAGE_RATING = '5.0'

const SOURCE_LABEL: Record<NonNullable<Testimonial['source']>, string> = {
  booksy: 'Booksy',
  google: 'Google',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
}

export function TestimonialsSection() {
  const testimonials = content.testimonials

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
        <div ref={headerRef} className="testimonials-header">
          {eyebrow && <span className="testimonials-eyebrow">{eyebrow}</span>}
          <h2 id="testimonials-title" className="testimonials-title">
            {title}
          </h2>
          {subtitle && <p className="testimonials-subtitle">{subtitle}</p>}
        </div>

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

        <div ref={gridRef} className="testimonials-grid">
          {items.map((item) => (
            <TestimonialCard key={item.id} testimonial={item} />
          ))}
        </div>

<div ref={footerRef} className="testimonials-footer">
  {content.externalLinks?.googleReviews && (
    <a
      href={content.externalLinks.googleReviews}
      target="_blank"
      rel="noopener noreferrer"
      className="testimonials-booksy-link"
      aria-label="Ver avaliações no Google (abre em nova aba)"
    >
      Ver avaliações no Google
      <ArrowUpRight aria-hidden="true" />
    </a>
  )}
</div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────── */
/* TestimonialCard                                              */
/* ─────────────────────────────────────────────────────────── */
interface TestimonialCardProps {
  testimonial: Testimonial
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const { name, quote, rating, context, source, date } = testimonial
  const initial = name.charAt(0).toUpperCase()
  const sourceLabel = source ? SOURCE_LABEL[source] : null

  return (
    <article className="testimonial-card">
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

      <blockquote className="testimonial-quote">
        <p>“{quote}”</p>
      </blockquote>

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

      {(sourceLabel || date) && (
        <div className="testimonial-meta">
          {sourceLabel && (
            <span
              className={`testimonial-source testimonial-source--${source}`}
            >
              {sourceLabel}
            </span>
          )}
          {date && <span className="testimonial-date">{date}</span>}
        </div>
      )}
    </article>
  )
}