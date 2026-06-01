/**
 * AboutSection — Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Section "Sobre" da landing pública.
 *
 * Estrutura v2:
 *   1. Eyebrow + Title
 *   2. Parágrafos introdutórios
 *   3. Bloco de Etimologia (opcional) — destaque dourado
 *   4. Parágrafos finais
 *   5. Manifesto (opcional) — linhas douradas em destaque
 *   6. Highlights (ícones)
 *   7. Coluna mídia com molduras SVG
 *
 * Lógica de split de parágrafos:
 *   - 1º parágrafo SEMPRE antes do bloco etymology
 *   - Demais parágrafos DEPOIS do etymology
 *   - Se não houver etymology, todos parágrafos ficam juntos
 *
 * SSR-safe: markup inicial neutro; .is-visible aplicado client-side.
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
  if (!about) return null

  const eyebrowRef = useReveal<HTMLDivElement>()
  const titleRef = useReveal<HTMLHeadingElement>()
  const introRef = useReveal<HTMLDivElement>()
  const etymologyRef = useReveal<HTMLDivElement>()
  const restRef = useReveal<HTMLDivElement>()
  const manifestoRef = useReveal<HTMLDivElement>()
  const imageRef = useReveal<HTMLDivElement>()
  const highlightsRef = useReveal<HTMLUListElement>()
  const accent1Ref = useReveal<HTMLDivElement>()
  const accent2Ref = useReveal<HTMLDivElement>()

  // Split: se há etymology, 1º parágrafo fica acima, resto abaixo
  const hasEtymology = Boolean(about.etymology)
  const introParagraphs = hasEtymology
    ? about.paragraphs.slice(0, 1)
    : about.paragraphs
  const restParagraphs = hasEtymology ? about.paragraphs.slice(1) : []

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

          {/* Parágrafos introdutórios */}
          {introParagraphs.length > 0 && (
            <div
              ref={introRef}
              className="ruah-about__paragraphs ruah-reveal ruah-reveal--up ruah-delay-200"
            >
              {introParagraphs.map((p, i) => (
                <p key={`intro-${i}`} className="ruah-about__paragraph">
                  {p}
                </p>
              ))}
            </div>
          )}

          {/* Bloco de etimologia destacado */}
          {about.etymology && (
            <div
              ref={etymologyRef}
              className="ruah-about__etymology ruah-reveal ruah-reveal--up ruah-delay-300"
            >
              <div className="ruah-about__etymology-header">
                <span
                  className="ruah-about__etymology-symbol"
                  lang="he"
                  dir="rtl"
                  aria-label={`${about.etymology.transliteration} em ${about.etymology.language}`}
                >
                  {about.etymology.symbol}
                </span>
                <div className="ruah-about__etymology-meta">
                  <span className="ruah-about__etymology-translit">
                    {about.etymology.transliteration}
                  </span>
                  <span className="ruah-about__etymology-lang">
                    {about.etymology.language}
                  </span>
                </div>
              </div>
              <p className="ruah-about__etymology-meaning">
                {about.etymology.meaning}
              </p>
              <p className="ruah-about__etymology-description">
                {about.etymology.description}
              </p>
            </div>
          )}

          {/* Parágrafos restantes */}
          {restParagraphs.length > 0 && (
            <div
              ref={restRef}
              className="ruah-about__paragraphs ruah-reveal ruah-reveal--up ruah-delay-400"
            >
              {restParagraphs.map((p, i) => (
                <p key={`rest-${i}`} className="ruah-about__paragraph">
                  {p}
                </p>
              ))}
            </div>
          )}

          {/* Manifesto — linhas douradas */}
          {about.manifesto && about.manifesto.length > 0 && (
            <div
              ref={manifestoRef}
              className="ruah-about__manifesto ruah-reveal ruah-reveal--up ruah-delay-500"
            >
              {about.manifesto.map((line, i) => (
                <p
                  key={`manifesto-${i}`}
                  className={`ruah-about__manifesto-line${
                    i === about.manifesto!.length - 1
                      ? ' ruah-about__manifesto-line--final'
                      : ''
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          )}

          {/* Highlights */}
          {about.highlights && about.highlights.length > 0 && (
            <ul
              ref={highlightsRef}
              className="ruah-about__highlights ruah-reveal ruah-reveal--up ruah-delay-500"
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
