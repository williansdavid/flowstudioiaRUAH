import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Contact Section - Art Deco Contemporary Design
 * Location, hours, and WhatsApp integration
 */
export default function ContactSection() {
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Localização',
      content: 'Av. Paulista, 1000 - São Paulo, SP',
      subtext: 'Estacionamento disponível',
    },
    {
      icon: Clock,
      title: 'Horário de Funcionamento',
      content: 'Seg - Sex: 09h às 20h',
      subtext: 'Sab: 09h às 18h | Dom: Fechado',
    },
    {
      icon: Phone,
      title: 'Telefone',
      content: '(11) 3000-0000',
      subtext: 'Atendimento direto',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-white to-blue-50 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-600/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#1a3a3a]/5 to-transparent rounded-full blur-3xl" />

      <div className="container relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-[#d4a574]" />
            <span className="font-heading text-sm tracking-widest text-[#d4a574] uppercase">
              Entre em Contato
            </span>
            <div className="h-1 w-12 bg-[#d4a574]" />
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-[#1a3a3a] mb-6">
            Visite-nos
          </h2>
          <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
            Estamos prontos para oferecer a melhor experiência de barbearia premium
          </p>
        </motion.div>

        {/* Contact Info Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {contactInfo.map((info, idx) => {
            const Icon = info.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group relative bg-white rounded-lg p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100 overflow-hidden"
              >
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4a574]/5 rounded-full blur-2xl group-hover:bg-[#d4a574]/10 transition-colors duration-300" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6 inline-block p-3 bg-gradient-to-br from-yellow-600/10 to-yellow-600/5 rounded-lg group-hover:from-yellow-600/20 group-hover:to-yellow-600/10 transition-colors duration-300">
                    <Icon className="w-8 h-8 text-[#d4a574]" />
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-semibold text-xl text-[#1a3a3a] mb-3 group-hover:text-[#d4a574] transition-colors duration-300">
                    {info.title}
                  </h3>

                  {/* Content */}
                  <p className="font-body text-gray-700 font-semibold mb-2">
                    {info.content}
                  </p>

                  {/* Subtext */}
                  <p className="font-body text-sm text-gray-600">
                    {info.subtext}
                  </p>

                  {/* Hover Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="relative bg-gradient-to-r from-[#1a3a3a] to-blue-800 rounded-lg p-12 md:p-16 overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4a574]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4a574]/5 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10 text-center">
            <h3 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para sua próxima experiência premium?
            </h3>
            <p className="font-body text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              Agende seu horário agora via WhatsApp e desfrute de uma experiência de barbearia incomparável
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-[#d4a574] hover:bg-yellow-700 text-black font-heading font-semibold px-8 py-6 text-lg rounded-sm transition-all duration-200 hover:shadow-lg hover:shadow-yellow-600/30 flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Agendar via WhatsApp
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white/10 font-heading font-semibold px-8 py-6 text-lg rounded-sm transition-all duration-200"
              >
                Ligar Agora
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
