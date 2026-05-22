import type { PublicServiceItem } from '@/lib/sections/fetchServices.server';
import { formatCurrency, formatDuration } from '@/lib/utils/format';

interface ServiceCardProps {
  service: PublicServiceItem;
  showPrice?: boolean;
  showDuration?: boolean;
}

export function ServiceCard({
  service,
  showPrice = true,
  showDuration = true,
}: ServiceCardProps) {
  const { name, description, price, durationMinutes, imageUrl, category } =
    service;

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-default bg-bg-elevated transition hover:border-brand/40 hover:shadow-lg"
      aria-label={name}
    >
      {imageUrl && (
        <div className="relative aspect-[4/3] overflow-hidden bg-bg-subtle">
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-6">
        <header className="flex flex-col gap-1">
          {category && (
            <span className="text-[11px] font-semibold uppercase tracking-widest text-brand">
              {category}
            </span>
          )}
          <h3 className="text-lg font-semibold text-fg">{name}</h3>
        </header>

        {description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-fg-muted">
            {description}
          </p>
        )}

        {(showPrice || showDuration) && (
          <footer className="mt-auto flex items-end justify-between border-t border-default pt-4">
            {showPrice && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-fg-muted">
                  A partir de
                </p>
                <p className="text-xl font-bold text-fg">
                  {formatCurrency(price)}
                </p>
              </div>
            )}
            {showDuration && (
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wider text-fg-muted">
                  Duração
                </p>
                <p className="text-sm font-medium text-fg">
                  {formatDuration(durationMinutes)}
                </p>
              </div>
            )}
          </footer>
        )}
      </div>
    </article>
  );
}
