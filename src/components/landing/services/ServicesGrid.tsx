import type { ServicesSection } from '@/types/sections';
import type { PublicServiceItem } from '@/lib/sections/types';
import { ServiceCard } from './_shared/ServiceCard';

type ServicesGridProps = ServicesSection['props'] & {
  /** Items injetados pelo loader SSR da rota. */
  data?: PublicServiceItem[];
};

const COLUMNS_MAP: Record<2 | 3 | 4, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

export function ServicesGrid(props: ServicesGridProps) {
  const {
    eyebrow = 'Serviços',
    title,
    description,
    columns = 3,
    showPrice = true,
    showDuration = true,
    data = [],
  } = props;

  const gridCols = COLUMNS_MAP[columns];

  return (
    <section
      id="servicos"
      aria-label="Nossos serviços"
      className="container-landing border-t border-default py-20"
    >
      <header className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h2>
        {description && (
          <p className="mt-3 leading-relaxed text-fg-muted">{description}</p>
        )}
      </header>

      {data.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-default bg-bg-subtle px-6 py-12 text-center">
          <p className="text-fg-muted">
            Em breve a lista completa de serviços disponíveis para agendamento.
          </p>
        </div>
      ) : (
        <div className={`mt-10 grid grid-cols-1 gap-6 ${gridCols}`}>
          {data.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              showPrice={showPrice}
              showDuration={showDuration}
            />
          ))}
        </div>
      )}
    </section>
  );
}
