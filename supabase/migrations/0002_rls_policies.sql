-- =====================================================
-- Migration 0002: RLS Policies
-- =====================================================

-- =====================================================
-- profiles
-- =====================================================
create policy "users read own profile" on public.profiles for select
  using (auth.uid() = id);

create policy "users update own profile" on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "admin read all profiles" on public.profiles for select
  using (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- user_roles
-- =====================================================
create policy "users read own roles" on public.user_roles for select
  using (auth.uid() = user_id);

create policy "admin manage roles" on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- clients
-- =====================================================
create policy "admin full access clients" on public.clients for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "staff read clients" on public.clients for select
  using (public.has_role(auth.uid(), 'staff'));

-- =====================================================
-- staff
-- =====================================================
create policy "admin full access staff" on public.staff for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "anyone read active staff" on public.staff for select
  using (active = true);

-- =====================================================
-- services
-- =====================================================
create policy "admin full access services" on public.services for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "anyone read active services" on public.services for select
  using (active = true);

-- =====================================================
-- appointments
-- =====================================================
create policy "admin full access appointments" on public.appointments for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "staff manage appointments" on public.appointments for all
  using (public.has_role(auth.uid(), 'staff'))
  with check (public.has_role(auth.uid(), 'staff'));

-- =====================================================
-- finance_transactions (apenas admin)
-- =====================================================
create policy "admin full access finance" on public.finance_transactions for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- leads
-- =====================================================
create policy "anyone insert leads" on public.leads for insert
  with check (true);

create policy "admin manage leads" on public.leads for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- whatsapp_messages
-- =====================================================
create policy "admin read whatsapp messages" on public.whatsapp_messages for select
  using (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- whatsapp_settings
-- =====================================================
create policy "admin manage whatsapp settings" on public.whatsapp_settings for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- ai_messages
-- =====================================================
create policy "anyone insert ai messages" on public.ai_messages for insert
  with check (true);

create policy "admin read ai messages" on public.ai_messages for select
  using (public.has_role(auth.uid(), 'admin'));
