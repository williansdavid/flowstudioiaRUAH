import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

/**
 * Testimonials Section - Art Deco Contemporary Design
 * Client reviews with elegant carousel layout
 */
export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'André Mendes',
      role: 'Empresário',
      content: 'Experiência excepcional. A atenção aos detalhes e o profissionalismo são incomparáveis. Voltarei com certeza.',
      rating: 5,
    },
    {
      name: 'Carlos Pereira',
      role: 'Advogado',
      content: 'Finalmente encontrei uma barbearia que entende o que é qualidade premium. Recomendo para todos os meus colegas.',
      rating: 5,
    },
    {
      name: 'Bruno Santos',
      role: 'Empresário Tech',
      content: 'O ambiente, o atendimento e o resultado final são perfeitos. Definitivamente meu lugar de confiança.',
      rating: 5,
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

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-yellow-600/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#1a3a3a]/5 to-transparent rounded-full blur-3xl" />

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
              Depoimentos
            </span>
            <div className="h-1 w-12 bg-[#d4a574]" />
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-[#1a3a3a] mb-6">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
            Satisfação e confiança são o reflexo de nosso compromisso com a excelência
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="group relative bg-white rounded-lg p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100 overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4a574]/5 rounded-full blur-2xl group-hover:bg-[#d4a574]/10 transition-colors duration-300" />

              {/* Content */}
              <div className="relative z-10">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-600 text-[#d4a574]" />
                  ))}
                </div>

                {/* Quote */}
                <p className="font-body text-gray-700 text-lg leading-relaxed mb-8 italic">
                  {testimonial.content}
                </p>

                {/* Author */}
                <div className="pt-6 border-t border-gray-100">
                  <p className="font-heading font-semibold text-[#1a3a3a] mb-1">
                    {testimonial.name}
                  </p>
                  <p className="font-body text-sm text-gray-600">
                    {testimonial.role}
                  </p>
                </div>

                {/* Hover Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
