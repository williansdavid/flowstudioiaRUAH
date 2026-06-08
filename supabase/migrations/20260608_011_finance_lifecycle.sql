-- =====================================================================
-- 20260608_011_finance_lifecycle.sql
-- RESGATE DE SCHEMA: estado vivia só em produção, fora do git (DEBT-015).
-- Idempotente: seguro rodar em banco que já tem as peças.
-- Ordem de dependência:
--   payment_methods -> appointments.fk -> clients.aggregates
--   -> recalc_client_aggregates -> handle_appointment_lifecycle -> trigger
-- A função handle_appointment_lifecycle é FIEL ao pg_get_functiondef
-- extraído de produção (08/06/2026).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. payment_methods
-- ---------------------------------------------------------------------
create table if not exists public.payment_methods (
  id              uuid        primary key default gen_random_uuid(),
  code            text        not null,
  description     text        not null,
  is_installment  boolean     not null default false,
  icon            text,
  is_active       boolean     not null default true,
  sort_order      integer     not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index if not exists payment_methods_code_key
  on public.payment_methods (code);

-- ---------------------------------------------------------------------
-- 2. appointments.payment_method_id (+ FK)
-- ---------------------------------------------------------------------
alter table public.appointments
  add column if not exists payment_method_id uuid;

do $$
begin if not exists ( select 1 from pg_constraint where conname = 'appointments_payment_method_id_fkey' ) then alter table public.appointments add constraint appointments_payment_method_id_fkey foreign key (payment_method_id) references public.payment_methods (id) on delete set null; end if; end
$$;

-- ---------------------------------------------------------------------
-- 3. finance_transactions: colunas exigidas pelo lifecycle
--    (appointment_id, staff_id, payment_method_id, occurred_at)
-- ---------------------------------------------------------------------
alter table public.finance_transactions
  add column if not exists appointment_id    uuid,
  add column if not exists staff_id          uuid,
  add column if not exists payment_method_id uuid,
  add column if not exists occurred_at       timestamptz;

do $$
begin if not exists ( select 1 from pg_constraint where conname = 'finance_transactions_appointment_id_fkey' ) then alter table public.finance_transactions add constraint finance_transactions_appointment_id_fkey foreign key (appointment_id) references public.appointments (id) on delete set null; end if; if not exists ( select 1 from pg_constraint where conname = 'finance_transactions_payment_method_id_fkey' ) then alter table public.finance_transactions add constraint finance_transactions_payment_method_id_fkey foreign key (payment_method_id) references public.payment_methods (id) on delete set null; end if; end
$$;

-- Garante 1 transação income/service por appointment (idempotência forte).
create unique index if not exists finance_tx_appointment_income_service_key
  on public.finance_transactions (appointment_id)
  where type = 'income' and category = 'service';

-- ---------------------------------------------------------------------
-- 4. clients: agregados + denormalizados
-- ---------------------------------------------------------------------
alter table public.clients
  add column if not exists total_appointments integer     not null default 0,
  add column if not exists total_spent        numeric     not null default 0,
  add column if not exists last_visit_at      timestamptz,
  add column if not exists full_name          text,
  add column if not exists phone              text,
  add column if not exists email              text;

-- ---------------------------------------------------------------------
-- 5. recalc_client_aggregates
-- ---------------------------------------------------------------------
create or replace function public.recalc_client_aggregates(p_client_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  update public.clients c
  set total_appointments = agg.cnt,
      total_spent        = agg.total,
      last_visit_at      = agg.last_visit,
      updated_at         = now()
  from (
    select count(*)::int                    as cnt,
           coalesce(sum(price), 0)::numeric as total,
           max(ends_at)                     as last_visit
    from public.appointments
    where client_id = p_client_id
      and status = 'completed'
  ) as agg
  where c.id = p_client_id;
end;
$function$;

-- ---------------------------------------------------------------------
-- 6. handle_appointment_lifecycle  (FIEL À PRODUÇÃO 08/06/2026)
--    Motor de receita: guard de pagamento + sincronização de
--    finance_transactions (income/service) com o ciclo do appointment.
-- ---------------------------------------------------------------------
create or replace function public.handle_appointment_lifecycle()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_service_name text;
begin
  if NEW.status = 'completed' and NEW.payment_method_id is null then
    raise exception 'Não é possível concluir o atendimento sem forma de pagamento (payment_method_id).';
  end if;

  -- INSERT
  if TG_OP = 'INSERT' then
    if NEW.status = 'completed' then
      if not exists (
        select 1 from public.finance_transactions
        where appointment_id = NEW.id and type = 'income' and category = 'service'
      ) then
        select s.name into v_service_name
        from public.services s where s.id = NEW.service_id;

        insert into public.finance_transactions
          (type, category, amount, description, appointment_id,
           staff_id, payment_method_id, occurred_at, created_by)
        values
          ('income', 'service', NEW.price,
           'Atendimento: ' || coalesce(v_service_name, 'servico'),
           NEW.id, NEW.staff_id, NEW.payment_method_id, NEW.ends_at, auth.uid());
      end if;
      perform public.recalc_client_aggregates(NEW.client_id);
    end if;
    return NEW;
  end if;

  -- UPDATE
  if TG_OP = 'UPDATE' then
    if NEW.status = 'completed' and OLD.status is distinct from 'completed' then
      if not exists (
        select 1 from public.finance_transactions
        where appointment_id = NEW.id and type = 'income' and category = 'service'
      ) then
        select s.name into v_service_name
        from public.services s where s.id = NEW.service_id;

        insert into public.finance_transactions
          (type, category, amount, description, appointment_id,
           staff_id, payment_method_id, occurred_at, created_by)
        values
          ('income', 'service', NEW.price,
           'Atendimento: ' || coalesce(v_service_name, 'servico'),
           NEW.id, NEW.staff_id, NEW.payment_method_id, NEW.ends_at, auth.uid());
      end if;
      perform public.recalc_client_aggregates(NEW.client_id);

    elsif OLD.status = 'completed' and NEW.status in ('cancelled', 'no_show') then
      delete from public.finance_transactions
      where appointment_id = NEW.id and type = 'income' and category = 'service';
      perform public.recalc_client_aggregates(NEW.client_id);

    elsif NEW.status = 'completed' and OLD.status = 'completed' then
      update public.finance_transactions
      set amount = NEW.price,
          payment_method_id = NEW.payment_method_id,
          staff_id = NEW.staff_id,
          occurred_at = NEW.ends_at,
          updated_at = now()
      where appointment_id = NEW.id and type = 'income' and category = 'service';
      perform public.recalc_client_aggregates(NEW.client_id);
    end if;

    if NEW.client_id is distinct from OLD.client_id then
      perform public.recalc_client_aggregates(OLD.client_id);
    end if;
    return NEW;
  end if;

  return NEW;
end;
$function$;

-- ---------------------------------------------------------------------
-- 7. trigger
-- ---------------------------------------------------------------------
drop trigger if exists trg_appointment_lifecycle on public.appointments;

create trigger trg_appointment_lifecycle
  after insert or update on public.appointments
  for each row
  execute function public.handle_appointment_lifecycle();
