/**
 * / — Landing Pública do Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Esta rota renderiza a landing pública do studio Ruah.
 *
 * Fonte da verdade: src/sites/ruah/**
 *
 * Estado atual: Header ✅ + HeroSection ✅
 * Próximas fases:
 *   - AboutSection
 *   - ServicesSection
 *   - GallerySection
 *   - TeamSection
 *   - TestimonialsSection
 *   - ContactSection
 *   - Footer
 * ----------------------------------------------------------------
 */

import { createFileRoute } from '@tanstack/react-router'
import { Header, HeroSection } from '@/sites/ruah/components'

export const Route = createFileRoute('/')({
  component: LandingRuah,
})

function LandingRuah() {
  return (
    <>
      <Header />
      <main className="min-h-screen w-full" style={{ background: '#1a3a3a' }}>
        <HeroSection />
      </main>
    </>
  )
}
