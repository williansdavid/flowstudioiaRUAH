import { Link, Outlet } from '@tanstack/react-router';
import { studioConfig } from '@/config/studio.config';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header
        className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur"
        aria-label="Cabeçalho principal"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label={`${studioConfig.name} — Início`}
          >
            <img
              src={studioConfig.branding.logoUrl}
              alt={studioConfig.name}
              className="h-8"
            />
            <span className="font-semibold">{studioConfig.name}</span>
          </Link>

          <nav
            className="hidden items-center gap-6 md:flex"
            aria-label="Navegação principal"
          >
            <Link to="/" className="text-sm hover:opacity-70">
              Início
            </Link>
            <Link
              to="/login"
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-neutral-50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-neutral-600">
          <p>{studioConfig.footer.copyrightText}</p>
          {studioConfig.contact.instagramUrl && (
            <a
              href={studioConfig.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block hover:opacity-70"
            >
              {studioConfig.contact.instagram}
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
