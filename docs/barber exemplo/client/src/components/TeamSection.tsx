import { motion } from 'framer-motion';
import { Instagram, Linkedin } from 'lucide-react';

/**
 * Team Section - Art Deco Contemporary Design
 * Professional barbers presentation with social links
 */
export default function TeamSection() {
  const team = [
    {
      name: 'Marcus Silva',
      specialty: 'Master Barber',
      bio: 'Especialista em cortes clássicos e contemporâneos com 20 anos de experiência',
      image: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031224296/8yvaXd69Yjbbu7aE2qoBC2/barber-detail-cut-CpqWV5bA9dsLDY4DuSygmc.webp',
    },
    {
      name: 'Felipe Costa',
      specialty: 'Beard Specialist',
      bio: 'Artesão em modelagem de barba e tratamentos capilares premium',
      image: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031224296/8yvaXd69Yjbbu7aE2qoBC2/barber-beard-grooming-BJhM8WnSf7eHMnsd7erAXf.webp',
    },
    {
      name: 'Rafael Oliveira',
      specialty: 'Design Specialist',
      bio: 'Especialista em design facial e acabamentos de precisão',
      image: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031224296/8yvaXd69Yjbbu7aE2qoBC2/hero-barber-premium-eKFFycqqwuEbBTsXa2GmC5.webp',
    },
  ];

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

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
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
              Nossa Equipe
            </span>
            <div className="h-1 w-12 bg-[#d4a574]" />
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-[#1a3a3a] mb-6">
            Profissionais Especializados
          </h2>
          <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
            Conheça os mestres por trás de cada corte impecável
          </p>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {team.map((member, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="group relative"
            >
              {/* Card Container */}
              <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 h-96 md:h-full">
                {/* Image */}
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content */}
                <motion.div
                  className="absolute inset-0 flex flex-col justify-end p-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="mb-4">
                    <h3 className="font-display text-3xl font-bold text-white mb-2">
                      {member.name}
                    </h3>
                    <p className="font-heading text-sm tracking-widest text-yellow-400 uppercase mb-3">
                      {member.specialty}
                    </p>
                  </div>

                  <p className="font-body text-sm text-gray-200 mb-6 leading-relaxed">
                    {member.bio}
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
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </motion.div>

                {/* Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
