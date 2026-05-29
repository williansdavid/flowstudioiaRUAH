/**
 * Footer — Ruah Barber Lounge (versão compacta horizontal)
 * ----------------------------------------------------------------
 * Layout:
 *   Desktop → [Logo+Manifesto]  ·  [Siga a Ruah (ícones + handle)]
 *   Mobile  → empilhado e centralizado
 *
 * Notas:
 *   - Ícones oficiais coloridos (SVGs inline)
 *   - Links reais vindos de identity.contact
 *   - Renderização condicional para links opcionais
 * ----------------------------------------------------------------
 */

import { content, identity, useReveal } from '@/sites/ruah'
import {
  InstagramIcon,
  FacebookIcon,
  GoogleBusinessIcon,
} from '../icons/SocialIcons'
import '@/sites/ruah/styles/footer.css'

export function Footer() {
  const rowRef = useReveal<HTMLDivElement>()
  const bottomRef = useReveal<HTMLDivElement>()

  const { contact } = identity
  const { manifesto, copyrightOwner, copyrightSuffix, credits } = content.footer
  const currentYear = new Date().getFullYear()

  return (
    <footer className="ruah-footer" role="contentinfo">
      <div className="ruah-footer__container ruah-footer__container--compact">

        {/* ─────────── LINHA PRINCIPAL (Brand + Social) ─────────── */}
        <div ref={rowRef} className="ruah-footer__row" data-reveal>
          {/* BRAND */}
          <div className="ruah-footer__brand ruah-footer__brand--inline">
            <h2 className="ruah-footer__logo">
              RUAH<span className="ruah-footer__logo-accent"> · </span>BARBER
            </h2>
            <p className="ruah-footer__manifesto">"{manifesto}"</p>
          </div>

          {/* SOCIAL */}
          <div className="ruah-footer__socials-wrap">
            <div className="ruah-footer__socials">
              {/* Instagram — sempre presente */}
              {contact.instagramUrl && (
                <a
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ruah-footer__social-btn"
                  aria-label={`Instagram da ${identity.shortName}`}
                  title="Instagram"
                >
                  <InstagramIcon className="ruah-footer__social-icon" />
                </a>
              )}

              {/* Facebook — opcional */}
              {contact.facebookUrl && (
                <a
                  href={contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ruah-footer__social-btn"
                  aria-label={`Facebook da ${identity.shortName}`}
                  title="Facebook"
                >
                  <FacebookIcon className="ruah-footer__social-icon" />
                </a>
              )}

              {/* Google Business — opcional */}
              {contact.googleBusinessUrl && (
                <a
                  href={contact.googleBusinessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ruah-footer__social-btn"
                  aria-label={`Google Business da ${identity.shortName}`}
                  title="Google Business"
                >
                  <GoogleBusinessIcon className="ruah-footer__social-icon" />
                </a>
              )}
            </div>

            <span className="ruah-footer__socials-handle">
              {contact.instagram}
            </span>
          </div>
        </div>

        {/* ─────────── ORNAMENTO INFERIOR ─────────── */}
        <div className="ruah-footer__ornament" aria-hidden="true">
          <span className="ruah-footer__ornament-line" />
          <span className="ruah-footer__ornament-diamond">◈</span>
          <span className="ruah-footer__ornament-diamond">◈</span>
          <span className="ruah-footer__ornament-diamond">◈</span>
          <span className="ruah-footer__ornament-line" />
        </div>

        {/* ─────────── BOTTOM ─────────── */}
        <div ref={bottomRef} className="ruah-footer__bottom" data-reveal>
          <p className="ruah-footer__copyright">
            © {currentYear} {copyrightOwner}. {copyrightSuffix}
          </p>
          <p className="ruah-footer__credits">{credits}</p>
        </div>

      </div>
    </footer>
  )
}
