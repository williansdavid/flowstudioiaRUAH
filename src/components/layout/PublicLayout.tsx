import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Instagram, Facebook, MapPin } from 'lucide-react';
import { studioConfig } from '@/config/studio.config';
import { buildThemeTokens } from '@/lib/theme/applyTheme';
import {
  getFacebookUrl,
  getInstagramUrl,
  getMapsUrl,
} from '@/config/studio.helpers';

interface PublicLayoutProps {
  children: ReactNode;
}

/**
 * Layout público — wrapper de todas as páginas públicas (landing, /login, etc).
 * - Aplica tema adaptativo (dark/light) via CSS vars
 * - Header sticky com logo + CTAs
 * - Footer com redes + endereço
 * - Mobile-first
 */
export function PublicLayout({ children }: PublicLayoutProps) {
  const theme = buildThemeTokens(studioConfig.branding);
  const instagram = getInstagramUrl();
  const facebook = getFacebookUrl();
  const maps = getMapsUrl();

  return (
    <div
      className={`${theme.className} flex min-h-screen flex-col bg-surface text-fg`}
      style={theme.cssVars as React.CSSProperties}
    >
      {/* HEADER */}
      <header
        className="sticky top-0 z-50 border-b border-default bg-surface/90 backdrop-blur-md"
        aria-label="Cabeçalho principal"
      >
        <div className="container-landing flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label={`${studioConfig.name} — Início`}
          >
            <img
              src={studioConfig.branding.logoUrl}
              alt={studioConfig.name}
              className="h-8 w-auto"
            />
            <span className="text-base font-semibold sm:text-lg">
              {studioConfig.name}
            </span>
          </Link>

          <nav
            className="flex items-center gap-2 sm:gap-4"
            aria-label="Navegação principal"
          >
            <a
              href="#servicos"
              className="hidden text-sm font-medium text-fg-muted hover:text-fg sm:inline"
            >
              Serviços
            </a>
            <a
              href="#sobre"
              className="hidden text-sm font-medium text-fg-muted hover:text-fg sm:inline"
            >
              Sobre
            </a>
            <a
              href="#contato"
              className="hidden text-sm font-medium text-fg-muted hover:text-fg sm:inline"
            >
              Contato
            </a>
            <Link
              to="/login"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-fg transition hover:opacity-90"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer
        id="contato"
        className="border-t border-default bg-surface-muted"
      >
        <div className="container-landing py-10">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Coluna 1 — Marca */}
            <div>
              <div className="flex items-center gap-2">
                <img
                  src={studioConfig.branding.logoUrl}
                  alt={studioConfig.name}
                  className="h-8 w-auto"
                />
                <span className="text-lg font-semibold">
                  {studioConfig.name}
                </span>
              </div>
              <p className="mt-3 text-sm text-fg-muted">
                {studioConfig.slogan}
              </p>
            </div>

            {/* Coluna 2 — Endereço */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
                Endereço
              </h3>
              <a
                href={maps}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-start gap-2 text-sm text-fg hover:text-brand"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {studioConfig.address.street}, {studioConfig.address.number}
                  <br />
                  {studioConfig.address.neighborhood} —{' '}
                  {studioConfig.address.city}/{studioConfig.address.state}
                </span>
              </a>
            </div>

            {/* Coluna 3 — Redes */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
                Redes sociais
              </h3>
              <div className="mt-3 flex items-center gap-3">
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="rounded-full border border-default p-2 text-fg-muted transition hover:border-brand hover:text-brand"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {facebook && (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="rounded-full border border-default p-2 text-fg-muted transition hover:border-brand hover:text-brand"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-default pt-6 text-center text-xs text-fg-muted">
            {studioConfig.footer.copyrightText}
          </div>
        </div>
      </footer>
    </div>
  );
}