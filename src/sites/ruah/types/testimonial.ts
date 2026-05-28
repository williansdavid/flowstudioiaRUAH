export interface Testimonial {
  /** ID único do depoimento (usado como key e em schema.org) */
  id: string;

  /** Iniciais do cliente (ex: "A.M.", "J.P.S.") */
  initials: string;

  /** Rótulo de contexto (ex: "Cliente desde 2023", "Cliente fiel") */
  label: string;

  /** Serviço relacionado ao depoimento */
  service: string;

  /** Nota de 1 a 5 estrelas */
  rating: 1 | 2 | 3 | 4 | 5;

  /** Texto do depoimento */
  quote: string;
}
