# 📚 Referência: Admin Legado (pré-Fase 1)

> Documento de memória técnica.
> O admin antigo foi **demolido** no início da Fase 1.
> Este arquivo registra os **padrões reaproveitáveis** para a futura reescrita.
>
> ⚠️ Nada aqui é código vivo. Use só como inspiração.

---

## 🎯 Contexto

Antes da Fase 1, o projeto tinha:
- Sistema de auth com Supabase (login, logout, roles, guards)
- CRUDs completos para: clients, services, team, appointments
- Calendar com DayView/WeekView
- AdminLayout com sidebar
- Sistema de "sections" dinâmicas na landing (descartado)

**Por que demolimos:** o admin foi feito antes da arquitetura "studio isolado" madurar. Vamos refazer com base sólida na Fase 2.

---

## ✅ Padrões BONS para reaproveitar na Fase 2

### 1. Estrutura `features/{dominio}/` — Vertical Slicing

O admin antigo organizava cada domínio assim:

```
src/features/clients/
├── components/
│   ├── ClientFormDialog.tsx
│   ├── ClientList.tsx
│   ├── ClientsFiltersBar.tsx
│   └── ClientOriginBadge.tsx
├── hooks.ts        ← useQuery + useMutation (React Query)
├── queries.ts      ← Server functions (TanStack Start)
├── types.ts        ← Tipos do domínio
└── index.ts        ← Barrel export
```

**Por que manter na Fase 2:**
- Tudo de um domínio fica junto
- Fácil deletar/refatorar feature inteira
- Reduz import paths longos

---

### 2. Server functions com `createServerFn` — TanStack Start

Padrão usado em `src/server/{dominio}/{ação}.ts`:

```ts
// Exemplo: src/server/clients/list-clients.ts (conceitual)
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';

export const listClients = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Client[]> => {
    const supabase = createSupabaseServer();
    const { data, error } = await supabase.from('clients').select('*');
    if (error) {
      console.error('[listClients]', error.message);
      return [];
    }
    return data ?? [];
  }
);
```

**Padrões reaproveitáveis:**
- 1 server fn = 1 arquivo (list, create, update, toggle)
- Pasta `_shared.ts` por domínio pra tipos comuns
- Erros logados, retorno seguro (não derrubar rota)

---

### 3. Hooks de React Query — `features/{dominio}/hooks.ts`

Padrão de wrapping de server fns:

```ts
// Conceitual
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listClients, createClient } from '@/server/clients/...';

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => listClients(),
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClientInput) => createClient({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}
```

**Reaproveitar:**
- `queryKey` array no formato `[dominio, ...filtros]`
- `invalidateQueries` no `onSuccess` da mutation
- Hooks nomeados como `use{Dominio}` e `use{Ação}{Dominio}`

---

### 4. Layout Admin — Split Sidebar + Outlet

O antigo `src/components/layout/AdminLayout.tsx` tinha:
- Sidebar fixa à esquerda (desktop) / drawer (mobile)
- Header com user menu (avatar + logout)
- `<Outlet />` no centro
- Loading bar entre navegações

**Reaproveitar:** arquitetura geral, mas **redesenhar do zero** com:
- Mobile first
- Componentes próprios (não importar `components/ui/` antigo)
- Estado de sidebar via store (Zustand ou nuqs)

---

### 5. Auth com Supabase — guards server-side

O fluxo era:
- `src/lib/auth/login.ts` → server fn que faz `supabase.auth.signInWithPassword`
- `src/lib/auth/session.ts` → `requireRole(roles[])` em `beforeLoad` das rotas
- `src/lib/auth/permissions.ts` → matrix role × resource

**Reaproveitar:**
- Conceito de `requireRole` em `beforeLoad`
- Redirect 403 quando faltar permissão
- Server-only para checagem (nunca client-side)

⚠️ **Reescrever do zero** porque:
- Vai integrar com novo schema de `user_roles` no Supabase
- Provavelmente vai usar Supabase RLS direto (em vez de matrix custom)

---

### 6. Design system (`components/ui/`)

Componentes que existiam:
```
Avatar, Badge, Button, Card, ConfirmDialog, DataTable, Dialog,
EmptyState, ErrorState, Input, Label, PageHeader, Spinner,
Switch, Textarea
```

**Decisão Fase 2:**
- NÃO reaproveitar o código antigo
- Construir UI **inline** dentro de cada feature, OU
- Avaliar shadcn/ui se ganhar produtividade

Motivo: o `cn` e os componentes antigos eram acoplados ao admin específico. Recomeçar dá liberdade.

---

### 7. Calendar (DayView/WeekView)

Estrutura mais complexa do admin antigo. Vivia em `src/features/calendar/`.

**Vale documentar isso quando voltar a precisar.** Por enquanto, ignorar.

---

## 🗂️ Tabelas Supabase usadas pelo admin antigo

(útil pra Fase 2 mapear o schema)

- `profiles` — perfis de usuário
- `user_roles` — admin / staff / client
- `clients` — clientes do studio
- `staff` — equipe
- `services` — catálogo público + admin
- `appointments` — agendamentos
- `finance_transactions` — caixa
- `leads` — captação da landing
- `whatsapp_messages` — histórico
- `whatsapp_settings` — config canal
- `ai_messages` — chat IA

---

## 🚫 Antipadrões que NÃO devem voltar

1. **`src/_legacy/admConfig/`** — config estática em arquivos TS pro studio. Substituído por `sites/{studio}/config/`.
2. **`components/landing/SectionsRenderer`** — sistema de "variants" de hero/services dinâmicos. Caiu porque cada studio agora tem seu próprio diretório `sites/{studio}/`.
3. **`lib/branding/applyBranding`** — manipulação imperativa do DOM pra aplicar branding. Substituído por CSS variables em `buildBrandingCss` (`sites/ruah/utils`).
4. **`lib/utils/cn`** acoplado a 19 componentes — gerou árvore inteira de dependência que precisou ser demolida junto.

---

## 📌 Próxima reescrita (Fase 2)

Quando voltar a construir admin:

1. **NÃO copie** este código.
2. **Releia** este documento pros padrões certos.
3. **Comece pequeno**: 1 feature de cada vez (services → clients → appointments).
4. **Mantenha sites/{studio}/ intocado**. Admin é separado.
5. **Use o mesmo Supabase do studio.** Cada studio tem seu próprio admin no mesmo deploy.

---

_Última atualização: início da Fase 1 (demolição admin legado)._
