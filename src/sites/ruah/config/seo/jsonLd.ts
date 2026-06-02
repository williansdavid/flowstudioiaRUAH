/**
 * Schema.org JSON-LD Builder — Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Gera o objeto LocalBusiness/HairSalon para rich snippets do Google.
 * Consumido pelo __root.tsx via head().scripts.
 *
 * Referência: https://schema.org/HairSalon
 * Validador: https://search.google.com/test/rich-results
 * ----------------------------------------------------------------
 */

import { identity } from '../identity'
import { businessHours } from '../businessHours'
import type { BusinessHours } from '../../types'

const DAY_MAP: Record<keyof BusinessHours, string> = {
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
}

function buildOpeningHours() {
  return (Object.keys(businessHours) as Array<keyof BusinessHours>)
    .filter((day) => businessHours[day].open)
    .map((day) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: DAY_MAP[day],
      opens: businessHours[day].opensAt,
      closes: businessHours[day].closesAt,
    }))
}

export function buildLocalBusinessJsonLd(siteUrl?: string) {
  const { name, description, contact, address } = identity

  return {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name,
    description,
    image: siteUrl ? `${siteUrl}/ruah/images/logo/logo.webp` : undefined,
    url: siteUrl,
    telephone: contact.phone,
    email: contact.email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${address.street}, ${address.number}${
        address.complement ? ` - ${address.complement}` : ''
      }`,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.zipCode,
      addressCountry: address.country,
    },
    openingHoursSpecification: buildOpeningHours(),
    sameAs: [
      contact.instagramUrl,
      contact.facebookUrl,
      contact.googleBusinessUrl,
    ].filter(Boolean),
  }
}
