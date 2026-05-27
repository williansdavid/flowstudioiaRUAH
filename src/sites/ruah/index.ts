/**
 * Barrel export — Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Ponto único de import do studio Ruah.
 *
 * Uso:
 *   import { branding, identity, businessHours, content } from '@/sites/ruah'
 *   import { buildBrandingCss, useReveal } from '@/sites/ruah'
 *   import type { HeroContent, ServicesContent } from '@/sites/ruah'
 * ----------------------------------------------------------------
 */

// ───────────────────────── Config ─────────────────────────
export { branding } from './config/branding'
export { identity } from './config/identity'
export { businessHours } from './config/businessHours'
export { content } from './config/content'

// ───────────────────────── Utils ──────────────────────────
export { buildBrandingCss } from './utils/buildBrandingCss'
export { useReveal } from './utils/useReveal'
export type { UseRevealOptions } from './utils/useReveal'

// ───────────────────────── Types ──────────────────────────
export type {
  // Identity
  StudioCategory,
  StudioContact,
  StudioAddress,
  StudioIdentity,
  // Branding
  BrandColors,
  BrandTypography,
  BrandLogo,
  BrandIdentity,
  // Business hours
  WeekDay,
  DayHours,
  BusinessHours,
  // Content — Hero
  HeroContent,
  // Content — Services
  ServiceItem,
  ServicesContent,
  // Content — Contact
  ContactContent,
  // Content — Footer
  FooterContent,
  // Content — About
  AboutContent,
  // Content — Team
  TeamMember,
  TeamContent,
  // Content — Gallery
  GalleryImage,
  GalleryContent,
  // Content — Testimonials
  Testimonial,
  TestimonialsContent,
  // Content — SEO
  SEOContent,
  // Content — Container
  StudioContent,
} from './types'
