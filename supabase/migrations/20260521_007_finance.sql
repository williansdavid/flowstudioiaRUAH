-- =====================================================
-- FINANCE TRANSACTIONS: caixa do studio
-- =====================================================

create table public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  type public.transaction_type not null,
  category public.transaction_category not null,
  amount numeric(10,2) not null check (amount > 0),
  description text,
  appointment_id uuid references public.appointments(id) on delete set null,
  staff_id uuid references public.staff(id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_finance_occurred on public.finance_transactions(occurred_at desc);
create index idx_finance_type on public.finance_transactions(type);
create index idx_finance_appointment on public.finance_transactions(appointment_id);

create trigger trg_finance_updated_at
  before update on public.finance_transactions
  for each row execute function public.set_updated_at();

alter table public.finance_transactions enable row level security;

-- Apenas admin acessa financeiro
create policy "finance_all_admin"
  on public.finance_transactions for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
