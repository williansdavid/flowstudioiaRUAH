-- ============================================================
-- Migration: clients walk-in support
-- ------------------------------------------------------------
-- Permite cadastro de clientes que NAO possuem conta no sistema
-- (modelo barbearia tradicional: 90% dos clientes nunca logam).
--
-- Regra de identidade:
--   - Cliente com conta:  profile_id IS NOT NULL
--                         (dados vem de public.profiles via FK)
--   - Cliente walk-in:    profile_id IS NULL
--                         + full_name obrigatorio
--                         + phone e email opcionais
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. Novas colunas em public.clients
-- ──────────────────────────────────────────────
alter table public.clients
  add column if not exists full_name text,
  add column if not exists phone     text,
  add column if not exists email     text;

-- ──────────────────────────────────────────────
-- 2. Constraint: garantir identidade minima
-- ──────────────────────────────────────────────
alter table public.clients
  drop constraint if exists clients_has_identity;

alter table public.clients
  add constraint clients_has_identity
  check (
    profile_id is not null
    or (full_name is not null and length(trim(full_name)) > 0)
  );

-- ──────────────────────────────────────────────
-- 3. Indices simples para busca por contato
-- ──────────────────────────────────────────────
create index if not exists idx_clients_phone
  on public.clients (phone)
  where phone is not null;

create index if not exists idx_clients_email
  on public.clients (lower(email))
  where email is not null;

-- Busca por nome usa ILIKE simples (sem pg_trgm no MVP).
-- Para volumes maiores no futuro, considerar pg_trgm + GIN.

-- ──────────────────────────────────────────────
-- 4. Garantir policy de INSERT para staff/admin
-- ──────────────────────────────────────────────
drop policy if exists "clients_insert_staff_admin" on public.clients;

create policy "clients_insert_staff_admin"
  on public.clients for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin', 'staff')
    )
  );

-- ──────────────────────────────────────────────
-- 5. Comentarios de documentacao
-- ──────────────────────────────────────────────
comment on column public.clients.full_name is
  'Nome do cliente walk-in (sem conta). NULL se cliente tem profile_id.';

comment on column public.clients.phone is
  'Telefone do cliente walk-in. Para clientes com conta, usar profiles.phone.';

comment on column public.clients.email is
  'Email do cliente walk-in (opcional). Para clientes com conta, usar profiles.email.';

comment on constraint clients_has_identity on public.clients is
  'Garante que todo cliente tenha identidade: ou profile_id (logado) ou full_name (walk-in).';
