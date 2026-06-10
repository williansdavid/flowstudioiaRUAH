/**
 * / — Landing Pública do Ruah Barber Lounge (Módulo 2 — Site)
 * ----------------------------------------------------------------
 * Concentra os ASSETS, TEMA e SEMÂNTICA de studio:
 *   - brandingCss do site (.theme-dark)
 *   - SEO completo (title, description, OG, Twitter)
 *   - favicon + theme-color
 *   - Google Fonts
 *   - styleHrefs
 *   - JSON-LD LocalBusiness
 *
 * O __root é neutro. Esta rota é dona do tema visual da landing.
 *
 * Fonte da verdade: src/sites/ruah/** via @/config/active-studio.
 * ----------------------------------------------------------------
 */
import { createFileRoute } from '@tanstack/react-router'
import {
  themeClass,
  styleHrefs,
  seo,
  branding,
  brandingCss,
  identity,
  buildLocalBusinessJsonLd,
} from '@/config/active-studio'
import {
  Header,
  Footer,
  HeroSection,
  AboutSection,
  ServicesSection,
  GallerySection,
  TestimonialsSection,
  HoursSection,
  WhatsAppFloating,
} from '@/sites/ruah/components'
import { fetchPublicServices } from '@/lib/public'

const LOGO_URL = branding.logo.light
const LOGO_ALT = branding.logo.alt
const OG_IMAGE = seo.ogImage ?? LOGO_URL
const THEME_COLOR = branding.colors.accent

const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?' +
  'family=Playfair+Display:wght@400;600;700;900&' +
  'family=Montserrat:wght@400;500;600;700&' +
  'family=Lato:wght@300;400;700&' +
  'display=swap'

const localBusinessJsonLd = JSON.stringify(
  buildLocalBusinessJsonLd(seo.canonicalUrl),
).replace(/</g, '\\u003c')

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: seo.title },
      { name: 'description', content: seo.description },
      ...(seo.keywords.length > 0
        ? [{ name: 'keywords', content: seo.keywords.join(', ') }]
        : []),

      { name: 'theme-color', content: THEME_COLOR },

      { property: 'og:title', content: seo.title },
      { property: 'og:description', content: seo.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'pt_BR' },
      { property: 'og:site_name', content: identity.name },
      { property: 'og:image', content: OG_IMAGE },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: LOGO_ALT },
      ...(seo.canonicalUrl
        ? [{ property: 'og:url', content: seo.canonicalUrl }]
        : []),

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: seo.title },
      { name: 'twitter:description', content: seo.description },
      { name: 'twitter:image', content: OG_IMAGE },
      { name: 'twitter:image:alt', content: LOGO_ALT },
    ],
    links: [
      { rel: 'icon', type: 'image/jpeg', href: LOGO_URL },
      { rel: 'apple-touch-icon', href: LOGO_URL },
      ...(seo.canonicalUrl
        ? [{ rel: 'canonical', href: seo.canonicalUrl }]
        : []),

      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      { rel: 'stylesheet', href: GOOGLE_FONTS_HREF },

      ...styleHrefs.map((href) => ({ rel: 'stylesheet' as const, href })),
    ],
    styles: [
      {
        id: 'studio-branding-vars',
        children: brandingCss,
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: localBusinessJsonLd,
      },
    ],
  }),
  loader: () => fetchPublicServices(),
  component: LandingRuah,
})

function LandingRuah() {
  const services = Route.useLoaderData()

  return (
    <div className={themeClass}>
      <Header />
      <main
        className="min-h-screen w-full"
        style={{ background: 'var(--color-bg)' }}
      >
        <HeroSection />
        <AboutSection />
        <ServicesSection services={services} />
        <GallerySection />
        <TestimonialsSection />
        <HoursSection />
      </main>
      <Footer />
      <WhatsAppFloating />
    </div>
  )
}
