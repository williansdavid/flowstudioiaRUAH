-- =====================================================
-- SERVICES: catálogo de serviços do studio
-- =====================================================

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes int not null check (duration_minutes > 0),
  price numeric(10,2) not null check (price >= 0),
  category text,
  image_url text,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_services_active on public.services(is_active) where is_active = true;
create index idx_services_category on public.services(category);

create trigger trg_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

alter table public.services enable row level security;

-- Listagem pública na landing
create policy "services_select_public"
  on public.services for select
  using (is_active = true);

-- Admin/staff veem inativos também
create policy "services_select_admin"
  on public.services for select
  using (public.current_user_role() in ('admin', 'staff'));

-- Apenas admin gerencia
create policy "services_insert_admin"
  on public.services for insert
  with check (public.current_user_role() = 'admin');

create policy "services_update_admin"
  on public.services for update
  using (public.current_user_role() = 'admin');

create policy "services_delete_admin"
  on public.services for delete
  using (public.current_user_role() = 'admin');
