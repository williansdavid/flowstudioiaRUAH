/**
 * / — Landing Pública do Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Esta rota renderiza a landing pública do studio Ruah.
 *
 * Fonte da verdade: src/sites/ruah/**
 *
 * Estado atual (Fase RUAH-8.2): HeroSection ✅
 * Próximas fases:
 *   - 8.3 AboutSection
 *   - 8.4 ServicesSection
 *   - 8.5 GallerySection
 *   - 8.6 TeamSection
 *   - 8.7 TestimonialsSection
 *   - 8.8 ContactSection
 *   - 8.9 Footer
 * ----------------------------------------------------------------
 */

import { createFileRoute } from '@tanstack/react-router'
import { HeroSection } from '@/sites/ruah/components'

export const Route = createFileRoute('/')({
  component: LandingRuah,
})

function LandingRuah() {
  return (
    <main className="min-h-screen w-full" style={{ background: '#1a3a3a' }}>
      <HeroSection />
    </main>
  )
}
