import type { HeroSection } from '@/types/sections';
import { HeroCtas } from './_shared/HeroCtas';
import { HeroOverlay } from './_shared/HeroOverlay';
import { HeroEyebrow } from './_shared/HeroEyebrow';

type HeroFullscreenProps = HeroSection['props'];

const HEIGHT_MAP: Record<NonNullable<HeroFullscreenProps['height']>, string> = {
  auto: 'min-h-[60svh]',
  sm: 'min-h-[50svh]',
  md: 'min-h-[70svh]',
  lg: 'min-h-[80svh]',
  fullscreen: 'min-h-[100svh]',
};

export function HeroFullscreen(props: HeroFullscreenProps) {
  const {
    eyebrow,
    title,
    subtitle,
    alignment = 'center',
    height = 'lg',
    background,
    primaryCta,
    secondaryCta,
  } = props;

  const heightClass = HEIGHT_MAP[height];
  const textAlign =
    alignment === 'left'
      ? 'text-left items-start'
      : alignment === 'right'
      ? 'text-right items-end'
      : 'text-center items-center';

  return (
    <section
      id="inicio"
      aria-label="Hero"
      className={`relative isolate flex w-full overflow-hidden ${heightClass}`}
    >
      {background?.src && (
        <img
          src={background.src}
          alt={background.alt ?? ''}
          aria-hidden={background.alt ? undefined : 'true'}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          style={{ objectPosition: background.position ?? 'center' }}
          loading="eager"
        />
      )}

      {background?.overlay?.enabled && (
        <HeroOverlay
          color={background.overlay.color}
          opacity={background.overlay.opacity}
        />
      )}

      <div
        className={`container-landing relative flex flex-1 flex-col justify-center py-24 ${textAlign}`}
      >
        <div className="max-w-3xl">
          {eyebrow && <HeroEyebrow>{eyebrow}</HeroEyebrow>}

          <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
              {subtitle}
            </p>
          )}

          <HeroCtas
            primary={primaryCta}
            secondary={secondaryCta}
            alignment={alignment}
            onLight={false}
          />
        </div>
      </div>
    </section>
  );
}
