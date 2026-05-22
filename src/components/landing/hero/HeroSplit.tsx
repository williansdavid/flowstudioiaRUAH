import type { HeroSection } from '@/types/sections';
import { HeroCtas } from './_shared/HeroCtas';
import { HeroEyebrow } from './_shared/HeroEyebrow';

type HeroSplitProps = HeroSection['props'];

export function HeroSplit(props: HeroSplitProps) {
  const {
    eyebrow,
    title,
    subtitle,
    background,
    sideImage,
    primaryCta,
    secondaryCta,
  } = props;

  const image = sideImage ?? (background?.src ? { src: background.src, alt: title, position: 'right' as const } : null);
  const imageOnLeft = image?.position === 'left';

  return (
    <section id="inicio" aria-label="Hero" className="relative w-full bg-surface">
      <div className="container-landing grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-24">
        <div className={imageOnLeft ? 'order-2 lg:order-2' : 'order-2 lg:order-1'}>
          {eyebrow && <HeroEyebrow>{eyebrow}</HeroEyebrow>}

          <h1 className="mt-4 text-4xl font-bold leading-tight text-fg sm:text-5xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-fg-muted">
              {subtitle}
            </p>
          )}

          <HeroCtas
            primary={primaryCta}
            secondary={secondaryCta}
            alignment="left"
            onLight={true}
          />
        </div>

        {image && (
          <div className={imageOnLeft ? 'order-1 lg:order-1' : 'order-1 lg:order-2'}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-2xl shadow-black/20">
              <img
                src={image.src}
                alt={image.alt ?? title}
                className="h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
