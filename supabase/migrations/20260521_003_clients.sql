-- =====================================================
-- CLIENTS: dados extras dos clientes (ficha completa)
-- =====================================================

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete cascade,
  birth_date date,
  notes text,
  preferences jsonb default '{}'::jsonb,
  total_appointments int not null default 0,
  total_spent numeric(10,2) not null default 0,
  last_visit_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_clients_profile on public.clients(profile_id);

create trigger trg_clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

alter table public.clients enable row level security;

-- Cliente lê próprios dados
create policy "clients_select_own"
  on public.clients for select
  using (
    profile_id = auth.uid()
  );

-- Admin e staff leem todos
create policy "clients_select_staff_admin"
  on public.clients for select
  using (public.current_user_role() in ('admin', 'staff'));

-- Cliente atualiza próprios dados
create policy "clients_update_own"
  on public.clients for update
  using (profile_id = auth.uid());

-- Admin/staff atualizam qualquer cliente
create policy "clients_update_staff_admin"
  on public.clients for update
  using (public.current_user_role() in ('admin', 'staff'));

-- Admin/staff inserem clientes manualmente
create policy "clients_insert_staff_admin"
  on public.clients for insert
  with check (public.current_user_role() in ('admin', 'staff'));

-- Auto-insert no signup do cliente (via trigger handle_new_user)
create policy "clients_insert_self"
  on public.clients for insert
  with check (profile_id = auth.uid());
