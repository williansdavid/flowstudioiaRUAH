/**
 * Site ativo do deploy.
 *
 * Cada deploy do FlowStudio AI representa UM salão.
 * Esta constante define qual pasta de `src/sites/*` será carregada.
 *
 * 🔒 HARDCODED por enquanto — quando aparecer o 2º cliente,
 * migramos pra `import.meta.env.VITE_STUDIO_SITE`.
 *
 * @see src/sites/ruah
 */
export const ACTIVE_SITE = 'ruah' as const;

export type ActiveSite = typeof ACTIVE_SITE;