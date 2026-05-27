import { Instagram, Facebook, Linkedin, MapPin, Phone, Mail } from 'lucide-react';

/**
 * Footer - Art Deco Contemporary Design
 * Professional footer with social links and contact info
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#1a3a3a] text-white overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#d4a574]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#d4a574]/5 rounded-full blur-3xl" />

      {/* Top Divider */}
      <div className="h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent" />

      <div className="container relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div>
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              RUAH
            </h2>
            <p className="font-body text-gray-300 mb-6">
              Experiência premium de barbearia que define novos padrões de elegância masculina.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="#"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#d4a574]/20 hover:bg-[#d4a574]/40 text-yellow-400 transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#d4a574]/20 hover:bg-[#d4a574]/40 text-yellow-400 transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#d4a574]/20 hover:bg-[#d4a574]/40 text-yellow-400 transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg text-white mb-6">
              Links Rápidos
            </h3>
            <ul className="space-y-3">
              {['Sobre Nós', 'Serviços', 'Galeria', 'Equipe', 'Contato'].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="font-body text-gray-300 hover:text-yellow-400 transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading font-semibold text-lg text-white mb-6">
              Serviços
            </h3>
            <ul className="space-y-3">
              {['Corte Masculino', 'Barba Premium', 'Acabamento Facial', 'Tratamento Capilar', 'Combo Premium'].map((service) => (
                <li key={service}>
                  <a
                    href="#"
                    className="font-body text-gray-300 hover:text-yellow-400 transition-colors duration-300"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading font-semibold text-lg text-white mb-6">
              Contato
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-[#d4a574] flex-shrink-0 mt-1" />
                <span className="font-body text-gray-300">
                  Av. Paulista, 1000
                  <br />
                  São Paulo, SP
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-[#d4a574] flex-shrink-0 mt-1" />
                <span className="font-body text-gray-300">(11) 3000-0000</span>
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 text-[#d4a574] flex-shrink-0 mt-1" />
                <span className="font-body text-gray-300">contato@ruah.com.br</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-600/30 to-transparent mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="font-body text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} Ruah Barber Lounge. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="font-body text-gray-400 hover:text-yellow-400 text-sm transition-colors duration-300">
              Política de Privacidade
            </a>
            <a href="#" className="font-body text-gray-400 hover:text-yellow-400 text-sm transition-colors duration-300">
              Termos de Serviço
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
