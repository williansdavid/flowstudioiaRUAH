/**
 * Types Barrel — Ruah
 * ----------------------------------------------------------------
 * Ponto unico de exportacao dos contratos do site Ruah.
 * Sempre importar via: `@/sites/ruah/types`
 *
 * Estrategia:
 *   - Types de NUCLEO (branding, identity, SEO) vem via fachada
 *     (sites/ruah/types/{branding,identity}.ts).
 *   - Types proprios do Ruah (content) ficam locais.
 * ----------------------------------------------------------------
 */

// Identity (fachada -> nucleo)
export type {
  StudioCategory,
  StudioContact,
  StudioAddress,
  StudioIdentity,
} from './identity'

// Branding (fachada -> nucleo)
export type {
  BrandColors,
  BrandSurfaces,
  BrandText,
  BrandUI,
  BrandTypography,
  BrandLogo,
  BrandShape,
  BrandTheme,
  BrandIdentity,
} from './branding'

// Business Hours (proprio do Ruah)
export type {
  WeekDay,
  DayHours,
  BusinessHours,
} from './businessHours'

// Content (proprio do Ruah, SEOContent vem via re-export do nucleo)
export type {
  // Hero
  HeroContent,
  // Services
  ServiceItem,
  ServicesContent,
  // Contact
  ContactContent,
  // Footer
  FooterContent,
  // About
  AboutContent,
  AboutEtymology,
  AboutHighlight,
  AboutHighlightIcon,
  // Team
  TeamMember,
  TeamContent,
  // Gallery
  GalleryImage,
  GalleryVideo,
  GalleryMedia,
  GalleryContent,
  // Testimonials
  Testimonial,
  TestimonialsContent,
  // External Links
  ExternalLinks,
  // SEO (re-exportado do nucleo via content.ts)
  SEOContent,
  // Container
  StudioContent,
} from './content'
