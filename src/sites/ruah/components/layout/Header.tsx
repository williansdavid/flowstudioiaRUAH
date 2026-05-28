import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useScrolled } from '@/sites/ruah/utils'
import { identity } from '@/sites/ruah/config/identity'

/**
 * Header — Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Header fixo com 2 estados visuais:
 *   - Topo (scrollY <= 50)   → transparente, sem borda
 *   - Rolado (scrollY > 50)  → glassmorphism + borda dourada sutil
 *
 * Comportamento:
 *   - Desktop: nav inline + CTA dourado
 *   - Mobile:  logo + hambúrguer → drawer fullscreen
 *
 * CTAs apontam para /login (porta única do sistema interno).
 * Links de nav usam anchors (#sobre, #servicos, etc).
 * ----------------------------------------------------------------
 */

const navLinks = [
  { label: 'Início', href: '#inicio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' }, 
  { label: 'Galeria', href: '#galeria' },
  { label: 'Depoimentos', href: '#testimonials' },
]

export function Header() {
  const scrolled = useScrolled(50)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNavClick = () => {
    setMobileOpen(false)
  }

  return (
    <>
      <header
        className={`ruah-header ${scrolled ? 'ruah-header--scrolled' : ''}`}
        aria-label="Navegação principal"
      >
        <div className="ruah-header__inner">
		{/* Logo */}
		<a href="#inicio" className="ruah-header__logo" aria-label={identity.name}>
		  <img
			src="/ruah/images/logo/logo.jpeg"
			alt={identity.name}
			className="ruah-header__logo-img"
			onError={(e) => {
			  const img = e.currentTarget
			  img.style.display = 'none'
			  const fallback = img.nextElementSibling as HTMLElement | null
			  if (fallback) fallback.style.display = 'flex'
			}}
		  />
		  <span className="ruah-header__logo-fallback" style={{ display: 'none', flexDirection: 'column' }}>
			<span className="ruah-header__logo-mark">RUAH</span>
			<span className="ruah-header__logo-sub">Barber Lounge</span>
		  </span>
		</a>
          {/* Nav Desktop */}
          <nav className="ruah-header__nav" aria-label="Links principais">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="ruah-header__nav-link">
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Desktop */}


          {/* Toggle Mobile */}
          <button
            type="button"
            className="ruah-header__toggle"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Drawer Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="ruah-mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
          >
            <nav className="ruah-mobile-menu__nav">
              {navLinks.map((link, idx) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  className="ruah-mobile-menu__link"
                  onClick={handleNavClick}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.03 * idx }}
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href="/login"
                className="ruah-btn ruah-btn--primary ruah-mobile-menu__cta"
                onClick={handleNavClick}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * navLinks.length }}
              >
                Agendar Horário
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
