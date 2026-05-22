-- =====================================================
-- STAFF: profissionais (cabeleireiros, manicures, etc)
-- =====================================================

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete cascade,
  specialty text,
  bio text,
  commission_rate numeric(5,2) default 0, -- 0-100
  is_bookable boolean not null default true,
  display_order int not null default 0,
  working_hours jsonb default '{}'::jsonb, -- { "mon": ["09:00","18:00"], ... }
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_staff_profile on public.staff(profile_id);
create index idx_staff_bookable on public.staff(is_bookable) where is_bookable = true;

create trigger trg_staff_updated_at
  before update on public.staff
  for each row execute function public.set_updated_at();

alter table public.staff enable row level security;

-- Listagem pública (landing): qualquer um vê staff ativo e agendável
create policy "staff_select_public"
  on public.staff for select
  using (is_bookable = true);

-- Admin/staff veem tudo
create policy "staff_select_admin"
  on public.staff for select
  using (public.current_user_role() in ('admin', 'staff'));

-- Apenas admin gerencia staff
create policy "staff_insert_admin"
  on public.staff for insert
  with check (public.current_user_role() = 'admin');

create policy "staff_update_admin"
  on public.staff for update
  using (public.current_user_role() = 'admin');

create policy "staff_delete_admin"
  on public.staff for delete
  using (public.current_user_role() = 'admin');

-- Staff edita o próprio perfil profissional
create policy "staff_update_own"
  on public.staff for update
  using (profile_id = auth.uid());
