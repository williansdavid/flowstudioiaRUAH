import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { studioConfig } from '@/config/studio.config';

/**
 * Painel esquerdo do AuthLayout (visível apenas em lg+).
 * Mostra hero bg do studio, nome, slogan e link de voltar.
 */
export function AuthBrandPanel() {
  const { name, slogan, hero } = studioConfig;

  return (
    <aside
      className="relative hidden w-1/2 overflow-hidden bg-neutral-900 lg:flex lg:flex-col"
      aria-hidden="true"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${hero.backgroundImage})` }}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80" />

      {/* Conteúdo */}
      <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
        {/* Topo: link voltar */}
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
          aria-hidden={false}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o site
        </Link>

        {/* Centro/baixo: identidade */}
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold leading-tight xl:text-4xl">
            {name}
          </h2>
          <p className="max-w-md text-base text-white/80 xl:text-lg">
            {slogan}
          </p>
        </div>
      </div>
    </aside>
  );
}
