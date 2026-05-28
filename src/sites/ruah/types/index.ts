/**
 * Types Barrel
 * ----------------------------------------------------------------
 * Ponto único de exportação dos contratos do site Ruah.
 * Sempre importar via: `@/sites/ruah/types`
 * ----------------------------------------------------------------
 */

export type {
  StudioCategory,
  StudioContact,
  StudioAddress,
  StudioIdentity,
} from './identity'

export type {
  BrandColors,
  BrandTypography,
  BrandLogo,
  BrandIdentity,
} from './branding'

export type {
  WeekDay,
  DayHours,
  BusinessHours,
} from './businessHours'

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
  // SEO
  SEOContent,
  // Container
  StudioContent,
} from './content'

