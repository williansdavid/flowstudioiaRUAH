# _legacy/admConfig

## ⚠️ CÓDIGO EM QUARENTENA

Esta pasta era anteriormente \src/config/\ e continha uma tentativa de
padronização de configuração de studios que foi **abandonada**.

## Por que ainda existe?

O **sistema ADM global atual** consome estes arquivos como recurso de
apresentação (CSS / branding / sections).

## Quando será removida?

Após a **reescrita visual completa do ADM global** (sprint futura).

## Consumidores atuais (5 arquivos)

- \src/components/layout/AdminLayout.tsx\
- \src/components/auth/AuthBrandPanel.tsx\
- \src/components/auth/AuthHeader.tsx\
- \src/lib/branding/applyBranding.ts\
- \src/lib/sections/loadSections.ts\

## ❌ NÃO IMPORTAR DESTA PASTA EM CÓDIGO NOVO

Todo código novo de landing pública deve usar \@/sites/ruah/*\.
Todo código novo do ADM deve aguardar a reescrita.
