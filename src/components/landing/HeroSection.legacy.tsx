import { ArrowRight, MessageCircle, Clock } from 'lucide-react';
import { studioConfig } from '@/config/studio.config';
import { getWhatsAppUrl, isOpenNow } from '@/config/studio.helpers';

/**
 * HeroSection — Bloco 9A.2
 * - Full-bleed background com overlay escuro
 * - 2 CTAs (WhatsApp como primário; âncora #servicos como secundário)
 * - Badge "Aberto agora" condicional via isOpenNow()
 * - Mobile-first
 *
 * TODO: trocar studioConfig.hero.backgroundImage por foto profissional da Ruah
 */
export function HeroSection() {
  const { hero } = studioConfig;
  const open = isOpenNow();

  const whatsappHref = getWhatsAppUrl(
    `Olá! Vim pelo site da ${studioConfig.name} e quero agendar um horário.`
  );

  return (
    <section
      id="hero"
      aria-label="Apresentação do studio"
      className="relative isolate flex min-h-[88vh] items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img
          src={hero.backgroundImage}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        {/* Overlay duplo: escurece + gradiente pra base */}
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-surface" />
      </div>

      {/* Conteúdo */}
      <div className="container-landing relative z-10 flex flex-col items-center text-center">
        {/* Badge aberto/fechado */}
        <div
          className={`mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm ${
            open
              ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
              : 'border-white/15 bg-white/5 text-white/80'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              open ? 'bg-emerald-400' : 'bg-white/60'
            }`}
            aria-hidden="true"
          />
          <Clock className="h-3 w-3" aria-hidden="true" />
          {open ? 'Aberto agora' : 'Fechado no momento'}
        </div>

        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
          {hero.title}
        </h1>

        <p className="mt-5 max-w-2xl text-base text-white/80 sm:text-lg">
          {hero.subtitle}
        </p>

        {/* CTAs */}
        <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg shadow-lg shadow-black/30 transition hover:opacity-90 sm:w-auto"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {hero.ctaText}
          </a>

          <a
            href="#servicos"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:w-auto"
          >
            Ver serviços
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
