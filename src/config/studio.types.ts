export type StudioCategory = 'salon' | 'barbershop' | 'beauty_studio' | 'spa';

export interface StudioContact {
  phone: string;
  whatsapp: string;
  email: string;
  instagram?: string;
  instagramUrl?: string;
  facebook?: string;
  tiktok?: string;
}

export interface StudioAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string; // padrão "Brasil"
  mapUrl?: string;
}

export interface StudioBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
  fontFamily?: string;
  ogImage?: string;
  heroImage?: string;
}

export interface StudioHero {
  title: string;
  subtitle: string;
  ctaText: string;
  backgroundImage: string;
}

export type BusinessHoursDay = { open: string; close: string } | null;

export interface StudioBusinessHours {
  monday?: BusinessHoursDay;
  tuesday?: BusinessHoursDay;
  wednesday?: BusinessHoursDay;
  thursday?: BusinessHoursDay;
  friday?: BusinessHoursDay;
  saturday?: BusinessHoursDay;
  sunday?: BusinessHoursDay;
}

export interface StudioSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
}

export interface StudioFeatures {
  enableAIChat: boolean;
  enableWhatsAppIntegration: boolean;
  enableOnlineBooking: boolean;
  enableLeadCapture: boolean;
}

export interface StudioFooter {
  copyrightText: string;
  additionalLinks?: { label: string; href: string }[];
}

export interface StudioConfig {
  id: string;
  slug: string;
  name: string;
  slogan: string;
  description: string;
  category: StudioCategory;
  contact: StudioContact;
  address: StudioAddress;
  branding: StudioBranding;
  hero: StudioHero;
  businessHours: StudioBusinessHours;
  seo: StudioSEO;
  features: StudioFeatures;
  footer: StudioFooter;
}
