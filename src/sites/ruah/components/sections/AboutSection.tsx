/**
 * AboutSection â€” Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Section "Sobre" da landing pÃºblica.
 *
 * Layout:
 *   - Desktop: 2 colunas (texto + highlights | imagem)
 *   - Mobile : stack vertical (texto â†’ imagem â†’ highlights)
 *
 * Dados:
 *   - Consome content.about (opcional â†’ guard early-return)
 *
 * AnimaÃ§Ã£o:
 *   - useReveal() em blocos-chave com stagger via .ruah-delay-*
 *   - Accents douradas: desenho progressivo via SVG stroke-dashoffset
 *
 * SSR-safe:
 *   - Markup inicial neutro; .is-visible aplicado client-side.
 * ----------------------------------------------------------------
 */
import {
  Wifi,
  Award,
  Sparkles,
  Scissors,
  Heart,
  Shield,
  type LucideIcon,
} from 'lucide-react'
import { content, useReveal } from '@/sites/ruah'

// Map de Ã­cones disponÃ­veis pra highlights
const HIGHLIGHT_ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  award: Award,
  sparkles: Sparkles,
  scissors: Scissors,
  heart: Heart,
  shield: Shield,
}

export function AboutSection() {
  const { about } = content

  // Guard: section opcional â€” nÃ£o renderiza se ausente
  if (!about) return null

  const eyebrowRef = useReveal<HTMLDivElement>()
  const titleRef = useReveal<HTMLHeadingElement>()
  const textRef = useReveal<HTMLDivElement>()
  const imageRef = useReveal<HTMLDivElement>()
  const highlightsRef = useReveal<HTMLUListElement>()
  const accent1Ref = useReveal<HTMLDivElement>()
  const accent2Ref = useReveal<HTMLDivElement>()

  return (
    <section
      id="sobre"
      className="ruah-about"
      aria-labelledby="ruah-about-title"
    >
      <div className="ruah-about__container">
        {/* Coluna texto */}
        <div className="ruah-about__text">
          {about.eyebrow && (
            <div
              ref={eyebrowRef}
              className="ruah-about__eyebrow ruah-reveal ruah-reveal--up"
            >
              <span className="ruah-about__eyebrow-line" aria-hidden="true" />
              <span className="ruah-about__eyebrow-text">{about.eyebrow}</span>
            </div>
          )}

          <h2
            ref={titleRef}
            id="ruah-about-title"
            className="ruah-about__title ruah-reveal ruah-reveal--up ruah-delay-100"
          >
            {about.title}
          </h2>

          <div
            ref={textRef}
            className="ruah-about__paragraphs ruah-reveal ruah-reveal--up ruah-delay-200"
          >
            {about.paragraphs.map((p, i) => (
              <p key={i} className="ruah-about__paragraph">
                {p}
              </p>
            ))}
          </div>

          {about.highlights && about.highlights.length > 0 && (
            <ul
              ref={highlightsRef}
              className="ruah-about__highlights ruah-reveal ruah-reveal--up ruah-delay-300"
            >
              {about.highlights.map((h, i) => {
                const Icon = HIGHLIGHT_ICONS[h.icon] ?? Sparkles
                return (
                  <li key={i} className="ruah-about__highlight">
                    <span
                      className="ruah-about__highlight-icon-wrap"
                      aria-hidden="true"
                    >
                      <Icon
                        className="ruah-about__highlight-icon"
                        size={18}
                        strokeWidth={1.75}
                      />
                    </span>
                    <span className="ruah-about__highlight-label">
                      {h.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Coluna imagem */}
        {about.image && (
          <div
            ref={imageRef}
            className="ruah-about__media ruah-reveal ruah-reveal--right ruah-delay-200"
          >
            <div className="ruah-about__media-frame">
              <img
                src={about.image}
                alt={`Interior da ${about.title}`}
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Accent 1 â€” moldura inferior-direita (desenho progressivo) */}
            <div
              ref={accent1Ref}
              className="ruah-about__media-accent ruah-about__media-accent--svg ruah-reveal-stroke ruah-delay-400"
              aria-hidden="true"
            >
              <svg
                className="ruah-about__media-accent-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  className="ruah-about__media-accent-rect"
                  x="0.5"
                  y="0.5"
                  width="99"
                  height="99"
                  rx="0.5"
                  ry="0.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            {/* Accent 2 â€” moldura superior-esquerda espelhada (desenho progressivo) */}
            <div
              ref={accent2Ref}
              className="ruah-about__media-accent ruah-about__media-accent--svg ruah-about__media-accent--2 ruah-reveal-stroke ruah-delay-500"
              aria-hidden="true"
            >
              <svg
                className="ruah-about__media-accent-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  className="ruah-about__media-accent-rect"
                  x="0.5"
                  y="0.5"
                  width="99"
                  height="99"
                  rx="0.5"
                  ry="0.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
