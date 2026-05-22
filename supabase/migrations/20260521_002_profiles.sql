-- =====================================================
-- PROFILES: dados básicos de todo usuário autenticado
-- =====================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'client',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);
create index idx_profiles_email on public.profiles(email);

-- Trigger de updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =====================================================
-- RLS
-- =====================================================
alter table public.profiles enable row level security;

-- Helper: função para checar role sem recursão de RLS
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
select role from public.profiles where id = auth.uid();
$$;

-- Cada usuário lê o próprio perfil
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Admin lê todos
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.current_user_role() = 'admin');

-- Staff lê clientes (para atender)
create policy "profiles_select_staff_clients"
  on public.profiles for select
  using (
    public.current_user_role() = 'staff'
    and role = 'client'
  );

-- Cada usuário atualiza o próprio perfil (exceto role)
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- Admin atualiza qualquer perfil
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.current_user_role() = 'admin');
