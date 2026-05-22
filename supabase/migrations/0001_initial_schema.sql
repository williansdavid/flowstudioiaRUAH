-- =====================================================
-- FlowStudio AI — Schema Inicial
-- =====================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- =====================================================
-- ENUM: Roles
-- =====================================================
create type public.app_role as enum ('admin', 'staff', 'client');

create type public.appointment_status as enum (
  'pending', 'confirmed', 'completed', 'cancelled', 'no_show'
);

create type public.transaction_type as enum ('income', 'expense');

-- =====================================================
-- TABLE: profiles (1:1 com auth.users)
-- =====================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- TABLE: user_roles (many-to-many)
-- =====================================================
create table public.user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index idx_user_roles_user_id on public.user_roles(user_id);

-- =====================================================
-- FUNCTION: has_role (SECURITY DEFINER — evita recursão RLS)
-- =====================================================
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
select exists ( select 1 from public.user_roles where user_id = _user_id and role = _role );
$$;

-- =====================================================
-- TABLE: clients
-- =====================================================
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text,
  email text,
  birthday date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- TABLE: staff
-- =====================================================
create table public.staff (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  role_title text,
  phone text,
  email text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =====================================================
-- TABLE: services
-- =====================================================
create table public.services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  duration_minutes integer not null default 30,
  price numeric(10, 2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =====================================================
-- TABLE: appointments
-- =====================================================
create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete set null,
  staff_id uuid references public.staff(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status public.appointment_status not null default 'pending',
  price numeric(10, 2),
  notes text,
  created_at timestamptz not null default now(),
  constraint chk_end_after_start check (end_at > start_at)
);

create index idx_appointments_start_at on public.appointments(start_at);
create index idx_appointments_staff_id on public.appointments(staff_id);

-- =====================================================
-- TABLE: finance_transactions
-- =====================================================
create table public.finance_transactions (
  id uuid primary key default uuid_generate_v4(),
  type public.transaction_type not null,
  amount numeric(10, 2) not null,
  category text,
  description text,
  occurred_at date not null default current_date,
  appointment_id uuid references public.appointments(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_finance_occurred_at on public.finance_transactions(occurred_at);

-- =====================================================
-- TABLE: leads (landing pública)
-- =====================================================
create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text,
  email text,
  message text,
  source text default 'landing',
  created_at timestamptz not null default now()
);

-- =====================================================
-- TABLE: whatsapp_settings
-- =====================================================
create table public.whatsapp_settings (
  id uuid primary key default uuid_generate_v4(),
  enabled boolean not null default false,
  instance_name text,
  webhook_url text,
  -- API key NÃO fica aqui — vai em env var (EVOLUTION_API_KEY)
  updated_at timestamptz not null default now()
);

-- =====================================================
-- TABLE: whatsapp_messages
-- =====================================================
create table public.whatsapp_messages (
  id uuid primary key default uuid_generate_v4(),
  direction text not null check (direction in ('inbound', 'outbound')),
  from_number text,
  to_number text,
  body text,
  status text,
  external_id text,
  created_at timestamptz not null default now()
);

create index idx_whatsapp_messages_created_at on public.whatsapp_messages(created_at desc);

-- =====================================================
-- TABLE: ai_messages
-- =====================================================
create table public.ai_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_ai_messages_session on public.ai_messages(session_id, created_at);

-- =====================================================
-- TRIGGER: auto-create profile on signup
-- =====================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', '')); return new; end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
