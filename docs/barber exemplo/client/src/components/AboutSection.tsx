import { motion } from 'framer-motion';

/**
 * About Section - Art Deco Contemporary Design
 * Sophisticated storytelling with elegant typography
 * Transmits exclusivity, elegance, and premium service
 */
export default function AboutSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-600/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#1a3a3a]/5 to-transparent rounded-full blur-3xl" />

      <div className="container relative z-10 max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Left Content */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Section Label */}
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-[#d4a574]" />
              <span className="font-heading text-sm tracking-widest text-[#d4a574] uppercase">
                Nossa História
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="font-display text-5xl md:text-6xl font-bold text-[#1a3a3a] leading-tight">
              Excelência em Cada Detalhe
            </h2>

            {/* Description */}
            <p className="font-body text-lg text-gray-700 leading-relaxed">
              A Ruah Barber Lounge foi fundada com a missão de redefir o padrão de excelência em barbearia premium. Cada corte, cada detalhe, cada interação é uma manifestação de nosso compromisso com a sofisticação e a precisão.
            </p>

            {/* Features List */}
            <div className="space-y-6 pt-4">
              {[
                { title: 'Profissionais Especializados', desc: 'Barbeiros com décadas de experiência internacional' },
                { title: 'Ambiente Premium', desc: 'Espaço sofisticado que transmite confiança e elegância' },
                { title: 'Serviços Personalizados', desc: 'Cada cliente recebe atenção exclusiva e customizada' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-1 bg-[#d4a574]" />
                  <div>
                    <h3 className="font-heading font-semibold text-[#1a3a3a] mb-2">
                      {item.title}
                    </h3>
                    <p className="font-body text-gray-600 text-sm">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            variants={itemVariants}
            className="relative h-96 md:h-full min-h-96 rounded-lg overflow-hidden shadow-2xl"
          >
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663031224296/8yvaXd69Yjbbu7aE2qoBC2/barber-lounge-interior-Q7i6jQhuQJWrmQgUCYCXgo.webp"
              alt="Ambiente Premium da Ruah Barber Lounge"
              className="w-full h-full object-cover"
            />
            {/* Overlay Accent */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a3a]/20 to-transparent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
