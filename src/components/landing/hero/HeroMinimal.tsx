import type { HeroSection } from '@/types/sections';
import { HeroCtas } from './_shared/HeroCtas';
import { HeroEyebrow } from './_shared/HeroEyebrow';

type HeroMinimalProps = HeroSection['props'];

export function HeroMinimal(props: HeroMinimalProps) {
  const {
    eyebrow,
    title,
    subtitle,
    alignment = 'center',
    primaryCta,
    secondaryCta,
  } = props;

  const textAlign =
    alignment === 'left'
      ? 'text-left items-start'
      : alignment === 'right'
      ? 'text-right items-end ml-auto'
      : 'text-center items-center mx-auto';

  return (
    <section id="inicio" aria-label="Hero" className="relative w-full bg-surface-muted">
      <div className="container-landing flex min-h-[60svh] flex-col justify-center py-20 sm:py-24">
        <div className={`flex max-w-3xl flex-col ${textAlign}`}>
          {eyebrow && <HeroEyebrow>{eyebrow}</HeroEyebrow>}

          <h1 className="mt-4 text-4xl font-bold leading-tight text-fg sm:text-5xl md:text-6xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fg-muted">
              {subtitle}
            </p>
          )}

          <HeroCtas
            primary={primaryCta}
            secondary={secondaryCta}
            alignment={alignment}
            onLight={true}
          />
        </div>
      </div>
    </section>
  );
}
