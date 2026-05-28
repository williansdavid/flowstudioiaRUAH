## [SEO] Otimização do Schema LocalBusiness — Ruah Barbearia

**Status:** 🟡 Pendente (não crítico)
**Prioridade:** Baixa
**Data registro:** 28/05/2026
**Origem:** Google Rich Results Test

### Contexto
Schema validado com sucesso (2 itens válidos: LocalBusiness + Organization).
Google reportou "problemas não críticos detectados" em Empresas locais.
Não bloqueia indexação nem Rich Results, mas pode ser refinado.

### Pendências
- [ ] Investigar quais campos geram aviso no Rich Results Test
- [ ] Avaliar adição de `geo` (GeoCoordinates lat/lng)
- [ ] Avaliar adição de `aggregateRating` (quando houver reviews reais)
- [ ] Validar formato internacional do `telephone` (+5514...)
- [ ] Validar resolução mínima da `image` (>=696px largura)
- [ ] Detalhar `openingHoursSpecification` completo

### Refatoração arquitetural relacionada
- [ ] Extrair lógica para `src/lib/seo/buildLocalBusinessJsonLd.ts`
- [ ] Extrair `src/lib/seo/buildOrganizationJsonLd.ts`
- [ ] Criar `src/lib/seo/escapeJsonLd.ts` (hardening XSS)
- [ ] Tornar SEO genérico para qualquer studio (consumir studioConfig)

### Critério de "pronto"
- Rich Results Test sem nenhum aviso
- Helpers reutilizáveis em `src/lib/seo/`
- Documentação de uso no README do módulo
