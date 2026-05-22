-- =====================================================
-- LEADS: captação da landing/WhatsApp
-- =====================================================

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text,
  source public.lead_source not null default 'landing',
  status public.lead_status not null default 'new',
  service_interest_id uuid references public.services(id) on delete set null,
  converted_client_id uuid references public.clients(id) on delete set null,
  contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_leads_status on public.leads(status);
create index idx_leads_created on public.leads(created_at desc);

create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

alter table public.leads enable row level security;

-- Inserção pública (landing form)
create policy "leads_insert_public"
  on public.leads for insert
  with check (true);

-- Apenas admin/staff visualizam e gerenciam
create policy "leads_select_staff_admin"
  on public.leads for select
  using (public.current_user_role() in ('admin', 'staff'));

create policy "leads_update_staff_admin"
  on public.leads for update
  using (public.current_user_role() in ('admin', 'staff'));
