import type { CtaConfig } from '@/types/sections';

interface HeroCtasProps {
  primary?: CtaConfig;
  secondary?: CtaConfig;
  alignment?: 'left' | 'center' | 'right';
  onLight?: boolean; // true = fundo claro (HeroSplit/Minimal), false = fundo escuro (Fullscreen)
}

export function HeroCtas({
  primary,
  secondary,
  alignment = 'center',
  onLight = false,
}: HeroCtasProps) {
  if (!primary && !secondary) return null;

  const justify =
    alignment === 'left'
      ? 'sm:justify-start'
      : alignment === 'right'
      ? 'sm:justify-end'
      : 'sm:justify-center';

  const secondaryClass = onLight
    ? 'border border-default bg-surface text-fg hover:bg-surface-muted'
    : 'border border-default bg-white/10 text-white backdrop-blur-sm hover:bg-white/20';

  return (
    <div className={`mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap ${justify}`}>
      {primary && (
        <a
          href={primary.href}
          target={primary.external ? '_blank' : undefined}
          rel={primary.external ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 text-base font-semibold text-brand-fg shadow-lg shadow-black/20 transition hover:opacity-90 focus-visible:outline-none"
        >
          {primary.label}
        </a>
      )}

      {secondary && (
        <a
          href={secondary.href}
          target={secondary.external ? '_blank' : undefined}
          rel={secondary.external ? 'noopener noreferrer' : undefined}
          className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold transition ${secondaryClass}`}
        >
          {secondary.label}
        </a>
      )}
    </div>
  );
}
