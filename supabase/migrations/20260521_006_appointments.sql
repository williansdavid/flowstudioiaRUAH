-- =====================================================
-- APPOINTMENTS: agendamentos
-- =====================================================

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'pending',
  price numeric(10,2) not null,
  notes text,
  cancelled_at timestamptz,
  cancelled_reason text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint chk_ends_after_starts check (ends_at > starts_at)
);

create index idx_appointments_client on public.appointments(client_id);
create index idx_appointments_staff on public.appointments(staff_id);
create index idx_appointments_starts on public.appointments(starts_at);
create index idx_appointments_status on public.appointments(status);
create index idx_appointments_staff_starts on public.appointments(staff_id, starts_at);

-- Evita overlap por staff (exclusão de cancelados)
create extension if not exists btree_gist;

alter table public.appointments
  add constraint no_overlap_per_staff
  exclude using gist (
    staff_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status not in ('cancelled', 'no_show'));

create trigger trg_appointments_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

alter table public.appointments enable row level security;

-- Cliente vê próprios agendamentos
create policy "appointments_select_own_client"
  on public.appointments for select
  using (
    client_id in (select id from public.clients where profile_id = auth.uid())
  );

-- Staff vê próprios agendamentos
create policy "appointments_select_own_staff"
  on public.appointments for select
  using (
    staff_id in (select id from public.staff where profile_id = auth.uid())
  );

-- Admin vê todos
create policy "appointments_select_admin"
  on public.appointments for select
  using (public.current_user_role() = 'admin');

-- Cliente cria próprio agendamento
create policy "appointments_insert_client"
  on public.appointments for insert
  with check (
    client_id in (select id from public.clients where profile_id = auth.uid())
    and status = 'pending'
  );

-- Admin/staff criam qualquer agendamento
create policy "appointments_insert_staff_admin"
  on public.appointments for insert
  with check (public.current_user_role() in ('admin', 'staff'));

-- Cliente cancela próprio agendamento (não pode alterar outros campos)
create policy "appointments_update_own_client"
  on public.appointments for update
  using (
    client_id in (select id from public.clients where profile_id = auth.uid())
  );

-- Admin/staff atualizam qualquer agendamento
create policy "appointments_update_staff_admin"
  on public.appointments for update
  using (public.current_user_role() in ('admin', 'staff'));
