/**
 * ServicesSection — Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Section "Serviços" da landing pública.
 *
 * Layout:
 *   - Header: eyebrow + título + subtítulo (centralizado)
 *   - Grid:   1 col (mobile) → 2 (md) → 3 (lg)
 *
 * Dados:
 *   - Header textual: content.services (estático, /config/content.ts)
 *   - Catálogo:       prop `services` (SSR loader → Supabase)
 *
 * Estados:
 *   - Lista vazia / undefined → empty state discreto
 *   - Sem flicker: SSR já entrega HTML com os cards renderizados
 *
 * Animação:
 *   - useReveal() no header + grid com stagger via .ruah-delay-*
 *
 * SSR-safe:
 *   - Markup neutro inicial; .is-visible aplicado client-side.
 * ----------------------------------------------------------------
 */
import { Clock, Scissors } from 'lucide-react'
import { content, useReveal } from '@/sites/ruah'
import { formatPrice, formatDuration } from '@/sites/ruah/utils'
import type { PublicServiceItem } from '@/lib/public'


interface ServicesSectionProps {
  /** Lista de serviços ativos vinda do SSR loader da rota. */
  services: PublicServiceItem[]
}

export function ServicesSection({ services }: ServicesSectionProps) {
  const { services: cfg } = content

  const eyebrowRef = useReveal<HTMLDivElement>()
  const titleRef = useReveal<HTMLHeadingElement>()
  const subtitleRef = useReveal<HTMLParagraphElement>()
  const gridRef = useReveal<HTMLDivElement>()

  const hasItems = services && services.length > 0

  return (
    <section
      id="servicos"
      className="ruah-services"
      aria-labelledby="ruah-services-title"
    >
      <div className="ruah-services__container">
        {/* Header */}
        <div className="ruah-services__header">
          {cfg.eyebrow && (
            <div
              ref={eyebrowRef}
              className="ruah-services__eyebrow ruah-reveal ruah-reveal--up"
            >
              <span className="ruah-services__eyebrow-line" aria-hidden="true" />
              <span className="ruah-services__eyebrow-text">{cfg.eyebrow}</span>
            </div>
          )}

          <h2
            ref={titleRef}
            id="ruah-services-title"
            className="ruah-services__title ruah-reveal ruah-reveal--up ruah-delay-100"
          >
            {cfg.title}
          </h2>

          {cfg.subtitle && (
            <p
              ref={subtitleRef}
              className="ruah-services__subtitle ruah-reveal ruah-reveal--up ruah-delay-200"
            >
              {cfg.subtitle}
            </p>
          )}
        </div>

        {/* Grid de cards */}
        {hasItems ? (
          <div
            ref={gridRef}
            className="ruah-services__grid ruah-reveal ruah-reveal--up ruah-delay-300"
          >
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="ruah-services__empty" role="status">
            <Scissors size={24} strokeWidth={1.5} aria-hidden="true" />
            <p>Em breve, nosso menu completo de serviços.</p>
          </div>
        )}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────
// ServiceCard — card individual do grid
// ─────────────────────────────────────────────────────────────────

function ServiceCard({ service }: { service: PublicServiceItem }) {
  return (
    <article className="ruah-services__card">
      <div className="ruah-services__card-accent" aria-hidden="true" />

      <header className="ruah-services__card-header">
        {service.category && (
          <span className="ruah-services__card-category">
            {service.category}
          </span>
        )}
        <h3 className="ruah-services__card-name">{service.name}</h3>
      </header>

      {service.description && (
        <p className="ruah-services__card-description">{service.description}</p>
      )}

      <footer className="ruah-services__card-footer">
        <span className="ruah-services__card-duration">
          <Clock size={14} strokeWidth={1.75} aria-hidden="true" />
          {formatDuration(service.durationMinutes)}
        </span>
        <span className="ruah-services__card-price">
          {formatPrice(service.price)}
        </span>
      </footer>
    </article>
  )
}
