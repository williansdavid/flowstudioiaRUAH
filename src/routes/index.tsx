import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { SectionsRenderer } from '@/components/landing/SectionsRenderer';
import { WhatsAppFloatingButton } from '@/components/landing/WhatsAppFloatingButton';
import { studioConfig } from '@/config/studio.config';
import { fetchPublicServices } from '@/lib/sections/fetchServices.server';

export const Route = createFileRoute('/')({
  component: LandingPage,
  loader: async () => {
    // SSR: busca dados públicos da landing em paralelo.
    // Erros são absorvidos dentro de cada fetch (retornam []).
    const [services] = await Promise.all([fetchPublicServices()]);
    return { services };
  },
  head: () => ({
    meta: [
      { title: studioConfig.seo.title },
      { name: 'description', content: studioConfig.seo.description },
      { name: 'keywords', content: studioConfig.seo.keywords.join(', ') },
      { property: 'og:title', content: studioConfig.seo.title },
      { property: 'og:description', content: studioConfig.seo.description },
      { property: 'og:image', content: studioConfig.seo.ogImage },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

function LandingPage() {
  const { services } = Route.useLoaderData();

  return (
    <PublicLayout>
      <SectionsRenderer data={{ services }} />

      {/* SOBRE — Bloco 9A.4 — TODO: migrar p/ variantsMap */}
      <section
        id="sobre"
        className="container-landing border-t border-default py-20"
        aria-label="Sobre o studio"
      >
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            Sobre
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            {studioConfig.about.title}
          </h2>
        </header>

        <div className="mt-6 max-w-3xl space-y-4 text-fg-muted">
          {studioConfig.about.paragraphs.map((p, i) => (
            <p key={i} className="leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Botão flutuante WhatsApp */}
      <WhatsAppFloatingButton />
    </PublicLayout>
  );
}
