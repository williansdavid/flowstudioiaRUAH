--
-- PostgreSQL database dump
--

\restrict LUtLtN2BoNLalEbfV7Vxdxg104Ob6DLb5iTahGjDh2j8wApzz39C2MeECTR79gB

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: appointment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.appointment_status AS ENUM (
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'no_show'
);


ALTER TYPE public.appointment_status OWNER TO postgres;

--
-- Name: lead_source; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.lead_source AS ENUM (
    'landing',
    'whatsapp',
    'instagram',
    'referral',
    'other'
);


ALTER TYPE public.lead_source OWNER TO postgres;

--
-- Name: lead_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.lead_status AS ENUM (
    'new',
    'contacted',
    'scheduled',
    'converted',
    'lost'
);


ALTER TYPE public.lead_status OWNER TO postgres;

--
-- Name: task_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.task_type_enum AS ENUM (
    'birthday',
    'remarketing'
);


ALTER TYPE public.task_type_enum OWNER TO postgres;

--
-- Name: transaction_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transaction_category AS ENUM (
    'service',
    'product',
    'commission',
    'rent',
    'utilities',
    'supplies',
    'marketing',
    'salary',
    'other'
);


ALTER TYPE public.transaction_category OWNER TO postgres;

--
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transaction_type AS ENUM (
    'income',
    'expense'
);


ALTER TYPE public.transaction_type OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'staff',
    'client'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: check_appointment_conflict(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_appointment_conflict() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  -- 1) Conflito com folga do mesmo profissional
  if exists (
    select 1
    from public.staff_time_off t
    where t.staff_id = new.staff_id
      and t.starts_at < new.ends_at
      and t.ends_at   > new.starts_at
  ) then
    raise exception '[business] Profissional esta de folga neste horario.'
      using errcode = 'P0001';
  end if;

  -- 2) Conflito com outro appointment ativo do mesmo profissional
  if exists (
    select 1
    from public.appointments a
    where a.staff_id = new.staff_id
      and a.id <> new.id
      and a.status in ('pending', 'confirmed', 'completed')
      and a.starts_at < new.ends_at
      and a.ends_at   > new.starts_at
  ) then
    raise exception '[business] Profissional ja possui agendamento neste horario.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;


ALTER FUNCTION public.check_appointment_conflict() OWNER TO postgres;

--
-- Name: create_appointment_multi_service(uuid, uuid, timestamp with time zone, jsonb, text, public.appointment_status, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_appointment_multi_service(p_client_id uuid, p_staff_id uuid, p_starts_at timestamp with time zone, p_services jsonb, p_notes text DEFAULT NULL::text, p_status public.appointment_status DEFAULT 'pending'::public.appointment_status, p_payment_method_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_appointment_id uuid;
  v_total_duration int := 0;
  v_total_price numeric := 0;
  v_svc jsonb;
  v_service_id uuid;
  v_qty int;
  v_dur int;
  v_price numeric;
  v_name text;
BEGIN
  IF p_services IS NULL OR jsonb_array_length(p_services) = 0 THEN
    RAISE EXCEPTION 'Informe ao menos um serviço';
  END IF;

  FOR v_svc IN SELECT * FROM jsonb_array_elements(p_services) LOOP
    v_service_id := (v_svc->>'serviceId')::uuid;
    v_qty := GREATEST(COALESCE((v_svc->>'quantity')::int, 1), 1);

    SELECT s.duration_minutes, s.price, s.name
      INTO v_dur, v_price, v_name
      FROM public.services s
     WHERE s.id = v_service_id AND s.is_active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Serviço inválido ou inativo: %', v_service_id;
    END IF;

    v_total_duration := v_total_duration + (v_dur * v_qty);
    v_total_price   := v_total_price   + (v_price * v_qty);
  END LOOP;

  INSERT INTO public.appointments
    (client_id, staff_id, service_id, starts_at, ends_at, status, price, notes, payment_method_id, created_by)
  VALUES
    (p_client_id, p_staff_id, NULL, p_starts_at,
     p_starts_at + (v_total_duration || ' minutes')::interval,
     p_status, v_total_price, p_notes, p_payment_method_id, auth.uid())
  RETURNING id INTO v_appointment_id;

  FOR v_svc IN SELECT * FROM jsonb_array_elements(p_services) LOOP
    v_service_id := (v_svc->>'serviceId')::uuid;
    v_qty := GREATEST(COALESCE((v_svc->>'quantity')::int, 1), 1);

    SELECT s.duration_minutes, s.price, s.name
      INTO v_dur, v_price, v_name
      FROM public.services s
     WHERE s.id = v_service_id;

    INSERT INTO public.appointment_services
      (appointment_id, service_id, service_name, duration_minutes, price, quantity)
    VALUES
      (v_appointment_id, v_service_id, v_name, v_dur, v_price, v_qty);
  END LOOP;

  RETURN v_appointment_id;
END;
$$;


ALTER FUNCTION public.create_appointment_multi_service(p_client_id uuid, p_staff_id uuid, p_starts_at timestamp with time zone, p_services jsonb, p_notes text, p_status public.appointment_status, p_payment_method_id uuid) OWNER TO postgres;

--
-- Name: current_user_role(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.current_user_role() RETURNS public.user_role
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT CASE WHEN is_active THEN role ELSE NULL END
  FROM public.profiles
  WHERE id = auth.uid();
$$;


ALTER FUNCTION public.current_user_role() OWNER TO postgres;

--
-- Name: finalize_sale(uuid, jsonb, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.finalize_sale(p_sale_id uuid, p_payments jsonb, p_user_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  v_sale public.sales%ROWTYPE;
  v_total_paid NUMERIC;
  v_payment RECORD;
  v_first_payment_method_id UUID;
  v_staff_id UUID;
  v_appointment_id UUID;
  v_category public.transaction_category;
  v_description TEXT;
  v_service_name TEXT;
BEGIN
  -- Lock na venda pra evitar condição de corrida
  SELECT * INTO v_sale
  FROM public.sales
  WHERE id = p_sale_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venda não encontrada.';
  END IF;

  IF v_sale.status != 'draft' THEN
    RAISE EXCEPTION 'Venda já finalizada.';
  END IF;

  -- Calcula total pago
  SELECT COALESCE(SUM((value->>'amount')::NUMERIC), 0)
  INTO v_total_paid
  FROM jsonb_array_elements(p_payments) AS value;

  IF ABS(v_total_paid - v_sale.total_amount) > 0.01 THEN
    RAISE EXCEPTION 'Soma dos pagamentos não confere com o total da venda.';
  END IF;

  -- 1. Insere pagamentos
  INSERT INTO public.sale_payments (sale_id, payment_method_id, amount)
  SELECT
    p_sale_id,
    (value->>'paymentMethodId')::UUID,
    (value->>'amount')::NUMERIC
  FROM jsonb_array_elements(p_payments) AS value;

  -- 2. Atualiza status da venda
  UPDATE public.sales
  SET status = 'completed', updated_at = NOW()
  WHERE id = p_sale_id;

  -- 3. Define categoria, staff_id e descrição
  IF v_sale.appointment_id IS NOT NULL THEN
    v_appointment_id := v_sale.appointment_id;

    -- Busca staff_id do appointment
    SELECT a.staff_id INTO v_staff_id
    FROM public.appointments a
    WHERE a.id = v_sale.appointment_id;

    -- Busca nome do serviço pelo sale_item
    SELECT COALESCE(s.name, 'serviço') INTO v_service_name
    FROM public.sale_items si
    LEFT JOIN public.services s ON s.id = si.item_id
    WHERE si.sale_id = p_sale_id AND si.item_type = 'service'
    LIMIT 1;

    v_category := 'service'::public.transaction_category;
    v_description := 'Atendimento: ' || v_service_name;
  ELSE
    -- Venda direta: staff_id = usuário logado (para comissão)
    v_staff_id := p_user_id;
    v_category := 'product'::public.transaction_category;
    v_description := 'Venda #' || substring(p_sale_id::TEXT, 1, 8) || ' - ' || COALESCE(v_sale.client_name, 'Cliente Avulso');
  END IF;

  -- 4. Gera UM registro no financeiro POR forma de pagamento
  FOR v_payment IN
    SELECT
      (value->>'paymentMethodId')::UUID AS payment_method_id,
      (value->>'amount')::NUMERIC AS amount
    FROM jsonb_array_elements(p_payments) AS value
  LOOP
    INSERT INTO public.finance_transactions (
      type, category, amount, description,
      reference_id, appointment_id, staff_id,
      payment_method_id, created_by
    )
    VALUES (
      'income'::public.transaction_type,
      v_category,
      v_payment.amount,
      v_description,
      p_sale_id,
      v_appointment_id,
      v_staff_id,
      v_payment.payment_method_id,
      p_user_id
    );
  END LOOP;

  -- 5. Se veio de agendamento, atualiza appointment
  IF v_sale.appointment_id IS NOT NULL THEN
    SELECT (value->>'paymentMethodId')::UUID
    INTO v_first_payment_method_id
    FROM jsonb_array_elements(p_payments) AS value
    LIMIT 1;

    UPDATE public.appointments
    SET status = 'completed', payment_method_id = v_first_payment_method_id
    WHERE id = v_sale.appointment_id;
  END IF;

  -- Tudo ok → COMMIT implícito
  RETURN jsonb_build_object('id', p_sale_id);
END;
$$;


ALTER FUNCTION public.finalize_sale(p_sale_id uuid, p_payments jsonb, p_user_id uuid) OWNER TO postgres;

--
-- Name: finalize_sale_v2(jsonb, jsonb, jsonb, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.finalize_sale_v2(p_sale_data jsonb, p_items jsonb, p_payments jsonb, p_user_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  v_sale_id UUID;
  v_total_amount NUMERIC;
  v_total_paid NUMERIC;
  v_payment RECORD;
  v_first_payment_method_id UUID;
  v_staff_id UUID;
  v_appointment_id UUID;
  v_category public.transaction_category;
  v_description TEXT;
  v_service_name TEXT;
BEGIN
  -- Calcula total dos itens
  SELECT COALESCE(SUM((value->>'unitPrice')::NUMERIC * (value->>'quantity')::NUMERIC), 0)
  INTO v_total_amount
  FROM jsonb_array_elements(p_items) AS value;

  -- Calcula total pago
  SELECT COALESCE(SUM((value->>'amount')::NUMERIC), 0)
  INTO v_total_paid
  FROM jsonb_array_elements(p_payments) AS value;

  IF ABS(v_total_paid - v_total_amount) > 0.01 THEN
    RAISE EXCEPTION 'Soma dos pagamentos não confere com o total da venda.';
  END IF;

  -- 1. Insere a sale (já nasce completed)
  INSERT INTO public.sales (sale_type, appointment_id, client_name, total_amount, status, created_by)
  VALUES (
    (p_sale_data->>'sale_type')::TEXT,
    NULLIF(p_sale_data->>'appointment_id', '')::UUID,
    p_sale_data->>'client_name',
    v_total_amount,
    'completed',
    p_user_id
  )
  RETURNING id INTO v_sale_id;

  -- 2. Insere os itens
  INSERT INTO public.sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price, is_locked)
  SELECT
    v_sale_id,
    (value->>'itemType')::TEXT,
    NULLIF(value->>'itemId', '')::UUID,
    value->>'itemName',
    (value->>'quantity')::INTEGER,
    (value->>'unitPrice')::NUMERIC,
    (value->>'unitPrice')::NUMERIC * (value->>'quantity')::NUMERIC,
    COALESCE((value->>'isLocked')::BOOLEAN, false)
  FROM jsonb_array_elements(p_items) AS value;

  -- 3. Insere pagamentos
  INSERT INTO public.sale_payments (sale_id, payment_method_id, amount)
  SELECT
    v_sale_id,
    (value->>'paymentMethodId')::UUID,
    (value->>'amount')::NUMERIC
  FROM jsonb_array_elements(p_payments) AS value;

  -- 4. Gera financeiro
  v_appointment_id := NULLIF(p_sale_data->>'appointment_id', '')::UUID;

  IF v_appointment_id IS NOT NULL THEN
    SELECT a.staff_id INTO v_staff_id
    FROM public.appointments a
    WHERE a.id = v_appointment_id;

    SELECT COALESCE(s.name, 'serviço') INTO v_service_name
    FROM jsonb_array_elements(p_items) AS value
    LEFT JOIN public.services s ON s.id = NULLIF(value->>'itemId', '')::UUID
    WHERE value->>'itemType' = 'service'
    LIMIT 1;

    v_category := 'service'::public.transaction_category;
    v_description := 'Atendimento: ' || v_service_name;
  ELSE
    v_staff_id := p_user_id;
    v_category := 'product'::public.transaction_category;
    v_description := 'Venda #' || substring(v_sale_id::TEXT, 1, 8) || ' - ' || COALESCE(p_sale_data->>'client_name', 'Cliente Avulso');
  END IF;

  FOR v_payment IN
    SELECT
      (value->>'paymentMethodId')::UUID AS payment_method_id,
      (value->>'amount')::NUMERIC AS amount
    FROM jsonb_array_elements(p_payments) AS value
  LOOP
    INSERT INTO public.finance_transactions (
      type, category, amount, description,
      reference_id, appointment_id, staff_id,
      payment_method_id, created_by
    )
    VALUES (
      'income'::public.transaction_type,
      v_category,
      v_payment.amount,
      v_description,
      v_sale_id,
      v_appointment_id,
      v_staff_id,
      v_payment.payment_method_id,
      p_user_id
    );
  END LOOP;

  -- 5. Se veio de agendamento, atualiza appointment
  IF v_appointment_id IS NOT NULL THEN
    SELECT (value->>'paymentMethodId')::UUID
    INTO v_first_payment_method_id
    FROM jsonb_array_elements(p_payments) AS value
    LIMIT 1;

    UPDATE public.appointments
    SET status = 'completed', payment_method_id = v_first_payment_method_id
    WHERE id = v_appointment_id;
  END IF;

  RETURN jsonb_build_object('id', v_sale_id);
END;
$$;


ALTER FUNCTION public.finalize_sale_v2(p_sale_data jsonb, p_items jsonb, p_payments jsonb, p_user_id uuid) OWNER TO postgres;

--
-- Name: finalize_sale_v2(jsonb, jsonb, jsonb, uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.finalize_sale_v2(p_sale_data jsonb, p_items jsonb, p_payments jsonb, p_user_id uuid, p_staff_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
    v_sale_id UUID;
    v_total_amount NUMERIC;
    v_total_paid NUMERIC;
    v_appointment_id UUID;
    v_first_payment_method_id UUID;

    -- Service aggregation
    v_service_total NUMERIC := 0;
    v_service_commission NUMERIC := 0;
    v_staff_commission_rate NUMERIC := 0;
    v_staff_id UUID;
    v_service_name TEXT;

    -- Product aggregation
    v_product_total NUMERIC := 0;
    v_product_commission NUMERIC := 0;
BEGIN
    -- Valida: total dos itens
    SELECT COALESCE(SUM((value->>'unitPrice')::NUMERIC * (value->>'quantity')::NUMERIC), 0)
    INTO v_total_amount
    FROM jsonb_array_elements(p_items) AS value;

    -- Valida: total pago
    SELECT COALESCE(SUM((value->>'amount')::NUMERIC), 0)
    INTO v_total_paid
    FROM jsonb_array_elements(p_payments) AS value;

    IF ABS(v_total_paid - v_total_amount) > 0.01 THEN
        RAISE EXCEPTION 'Soma dos pagamentos não confere com o total da venda.';
    END IF;

    -- 1. Cria a venda (já completed)
    INSERT INTO public.sales (sale_type, appointment_id, client_name, total_amount, status, created_by)
    VALUES (
        (p_sale_data->>'sale_type')::TEXT,
        NULLIF(p_sale_data->>'appointment_id', '')::UUID,
        p_sale_data->>'client_name',
        v_total_amount,
        'completed',
        p_user_id
    )
    RETURNING id INTO v_sale_id;

    -- 2. Insere os itens
    INSERT INTO public.sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price, is_locked)
    SELECT
        v_sale_id,
        (value->>'itemType')::TEXT,
        NULLIF(value->>'itemId', '')::UUID,
        value->>'itemName',
        (value->>'quantity')::INTEGER,
        (value->>'unitPrice')::NUMERIC,
        (value->>'unitPrice')::NUMERIC * (value->>'quantity')::NUMERIC,
        COALESCE((value->>'isLocked')::BOOLEAN, false)
    FROM jsonb_array_elements(p_items) AS value;

    -- 3. Insere os pagamentos (split detalhado para auditoria)
    INSERT INTO public.sale_payments (sale_id, payment_method_id, amount)
    SELECT
        v_sale_id,
        (value->>'paymentMethodId')::UUID,
        (value->>'amount')::NUMERIC
    FROM jsonb_array_elements(p_payments) AS value;

    -- ─────────────────────────────────────────────────────────
    -- 4. Gera financeiro AGRUPADO por tipo (service / product)
    -- ─────────────────────────────────────────────────────────
    v_appointment_id := NULLIF(p_sale_data->>'appointment_id', '')::UUID;

    -- Soma total de serviços
    SELECT COALESCE(SUM((value->>'unitPrice')::NUMERIC * (value->>'quantity')::NUMERIC), 0)
    INTO v_service_total
    FROM jsonb_array_elements(p_items) AS value
    WHERE value->>'itemType' = 'service';

    -- Soma total de produtos
    SELECT COALESCE(SUM((value->>'unitPrice')::NUMERIC * (value->>'quantity')::NUMERIC), 0)
    INTO v_product_total
    FROM jsonb_array_elements(p_items) AS value
    WHERE value->>'itemType' = 'product';

    -- ─── Bloco Serviço ───────────────────────────────────────
    IF v_service_total > 0 THEN
        -- Descobre o staff
        IF v_appointment_id IS NOT NULL THEN
            SELECT a.staff_id INTO v_staff_id
            FROM public.appointments a
            WHERE a.id = v_appointment_id;
        ELSE
            v_staff_id := p_staff_id;
        END IF;

        -- Pega a taxa de comissão do staff
        -- ⚠️ CORRIGIDO: appointments.staff_id referencia staff.id, NÃO profile_id
        SELECT COALESCE(commission_rate, 0) INTO v_staff_commission_rate
        FROM public.staff
        WHERE id = v_staff_id;

        v_service_commission := ROUND(v_service_total * (v_staff_commission_rate / 100), 2);

        -- Nome do serviço para descrição
        SELECT COALESCE(s.name, 'serviço') INTO v_service_name
        FROM jsonb_array_elements(p_items) AS value
        LEFT JOIN public.services s ON s.id = NULLIF(value->>'itemId', '')::UUID
        WHERE value->>'itemType' = 'service'
        LIMIT 1;

        INSERT INTO public.finance_transactions (
            type, category, amount, commission_value, description,
            reference_id, appointment_id, staff_id, payment_method_id, created_by
        )
        VALUES (
            'income'::public.transaction_type,
            'service'::public.transaction_category,
            v_service_total,
            COALESCE(v_service_commission, 0),
            'Atendimento: ' || v_service_name,
            v_sale_id,
            v_appointment_id,
            v_staff_id,
            (SELECT (value->>'paymentMethodId')::UUID FROM jsonb_array_elements(p_payments) AS value LIMIT 1),
            p_user_id
        );
    END IF;

    -- ─── Bloco Produto ──────────────────────────────────────
    IF v_product_total > 0 THEN
        SELECT COALESCE(SUM(
            ((value->>'unitPrice')::NUMERIC * (value->>'quantity')::NUMERIC)
            * COALESCE(p.commission_rate, 0) / 100
        ), 0)
        INTO v_product_commission
        FROM jsonb_array_elements(p_items) AS value
        LEFT JOIN public.products p ON p.id = NULLIF(value->>'itemId', '')::UUID
        WHERE value->>'itemType' = 'product';

        INSERT INTO public.finance_transactions (
            type, category, amount, commission_value, description,
            reference_id, appointment_id, staff_id, payment_method_id, created_by
        )
        VALUES (
            'income'::public.transaction_type,
            'product'::public.transaction_category,
            v_product_total,
            COALESCE(v_product_commission, 0),
            'Venda #' || substring(v_sale_id::TEXT, 1, 8) || ' - ' || COALESCE(p_sale_data->>'client_name', 'Cliente Avulso'),
            v_sale_id,
            v_appointment_id,
            COALESCE(v_staff_id, p_staff_id),
            (SELECT (value->>'paymentMethodId')::UUID FROM jsonb_array_elements(p_payments) AS value LIMIT 1),
            p_user_id
        );
    END IF;

    -- 5. Se veio de agendamento, atualiza appointment
    IF v_appointment_id IS NOT NULL THEN
        SELECT (value->>'paymentMethodId')::UUID
        INTO v_first_payment_method_id
        FROM jsonb_array_elements(p_payments) AS value
        LIMIT 1;

        UPDATE public.appointments
        SET status = 'completed', payment_method_id = v_first_payment_method_id
        WHERE id = v_appointment_id;
    END IF;

    RETURN jsonb_build_object('id', v_sale_id);
END;
$$;


ALTER FUNCTION public.finalize_sale_v2(p_sale_data jsonb, p_items jsonb, p_payments jsonb, p_user_id uuid, p_staff_id uuid) OWNER TO postgres;

--
-- Name: get_appointments_count(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_appointments_count(p_start_date date, p_end_date date) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_count BIGINT;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM appointments
  WHERE starts_at >= p_start_date
    AND starts_at < (p_end_date + INTERVAL '1 day')
    AND status IN ('completed');
  RETURN v_count;
END;
$$;


ALTER FUNCTION public.get_appointments_count(p_start_date date, p_end_date date) OWNER TO postgres;

--
-- Name: get_cash_flow_report(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_cash_flow_report(p_start_date date, p_end_date date) RETURNS TABLE(month text, income numeric, expense numeric, net_balance numeric)
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  select
    to_char(date_trunc('month', ft.occurred_at), 'YYYY-MM')::text as month,
    coalesce(sum(ft.amount) filter (where ft.type = 'income'), 0)::numeric as income,
    coalesce(sum(ft.amount) filter (where ft.type = 'expense'), 0)::numeric as expense,
    (
      coalesce(sum(ft.amount) filter (where ft.type = 'income'), 0)
      -
      coalesce(sum(ft.amount) filter (where ft.type = 'expense'), 0)
    )::numeric as net_balance
  from finance_transactions ft
  where ft.occurred_at >= p_start_date::timestamptz
    and ft.occurred_at < (p_end_date + interval '1 day')::timestamptz
  group by date_trunc('month', ft.occurred_at)
  order by month;
$$;


ALTER FUNCTION public.get_cash_flow_report(p_start_date date, p_end_date date) OWNER TO postgres;

--
-- Name: get_cash_flow_report_daily(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_cash_flow_report_daily(p_start_date date, p_end_date date) RETURNS TABLE(date text, income numeric, expense numeric, net_balance numeric)
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  SELECT
    to_char(ft.occurred_at AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD')::text as date,
    coalesce(sum(ft.amount) filter (where ft.type = 'income'), 0)::numeric as income,
    coalesce(sum(ft.amount) filter (where ft.type = 'expense'), 0)::numeric as expense,
    (
      coalesce(sum(ft.amount) filter (where ft.type = 'income'), 0)
      -
      coalesce(sum(ft.amount) filter (where ft.type = 'expense'), 0)
    )::numeric as net_balance
  FROM finance_transactions ft
  WHERE ft.occurred_at >= p_start_date::timestamptz
    AND ft.occurred_at < (p_end_date + interval '1 day')::timestamptz
  GROUP BY to_char(ft.occurred_at AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD')
  ORDER BY date;
$$;


ALTER FUNCTION public.get_cash_flow_report_daily(p_start_date date, p_end_date date) OWNER TO postgres;

--
-- Name: get_clients_by_birth_month(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_clients_by_birth_month(p_month integer) RETURNS TABLE(id uuid)
    LANGUAGE sql STABLE
    AS $$
  SELECT id FROM clients WHERE EXTRACT(MONTH FROM birth_date) = p_month;
$$;


ALTER FUNCTION public.get_clients_by_birth_month(p_month integer) OWNER TO postgres;

--
-- Name: get_expenses_by_category_report(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_expenses_by_category_report(p_start_date date, p_end_date date) RETURNS TABLE(category text, total numeric, percentage numeric)
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  with expense_totals as (
    select
      ft.category,
      sum(ft.amount)::numeric as total
    from finance_transactions ft
    where ft.type = 'expense'
      and ft.occurred_at >= p_start_date::timestamptz
      and ft.occurred_at < (p_end_date + interval '1 day')::timestamptz
    group by ft.category
  ),
  grand_total as (
    select sum(total)::numeric as total from expense_totals
  )
  select
    et.category,
    et.total,
    case when gt.total > 0 then round((et.total / gt.total * 100)::numeric, 1) else 0 end
  from expense_totals et
  cross join grand_total gt
  order by et.total desc;
$$;


ALTER FUNCTION public.get_expenses_by_category_report(p_start_date date, p_end_date date) OWNER TO postgres;

--
-- Name: get_new_vs_returning_report(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_new_vs_returning_report(p_start_date date, p_end_date date) RETURNS TABLE(month text, new_clients bigint, returning_clients bigint, total_clients bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  WITH client_first AS (
    SELECT
      a.client_id,
      MIN(a.starts_at::DATE) AS first_date
    FROM appointments a
    WHERE a.client_id IS NOT NULL
      AND a.status IN ('completed', 'confirmed', 'cancelled', 'no_show')
    GROUP BY a.client_id
  ),
  month_clients AS (
    SELECT
      DATE_TRUNC('month', a.starts_at)::DATE AS ref_month,
      a.client_id,
      cf.first_date
    FROM appointments a
    LEFT JOIN client_first cf ON cf.client_id = a.client_id
    WHERE a.starts_at >= p_start_date
      AND a.starts_at < (p_end_date + INTERVAL '1 day')
      AND a.client_id IS NOT NULL
      AND a.status IN ('completed', 'confirmed', 'cancelled', 'no_show')
    GROUP BY DATE_TRUNC('month', a.starts_at)::DATE, a.client_id, cf.first_date
  )
  SELECT
    TO_CHAR(mc.ref_month, 'YYYY-MM')::TEXT,
    COUNT(*) FILTER (
      WHERE mc.first_date >= mc.ref_month
        AND mc.first_date < (mc.ref_month + INTERVAL '1 month')
    )::BIGINT,
    COUNT(*) FILTER (WHERE mc.first_date < mc.ref_month)::BIGINT,
    COUNT(*)::BIGINT
  FROM month_clients mc
  GROUP BY mc.ref_month
  ORDER BY mc.ref_month;
END;
$$;


ALTER FUNCTION public.get_new_vs_returning_report(p_start_date date, p_end_date date) OWNER TO postgres;

--
-- Name: get_occupancy_rate_report(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_occupancy_rate_report(p_start_date date, p_end_date date) RETURNS TABLE(date date, filled_slots bigint, cancellations bigint, no_shows bigint, staff_working bigint)
    LANGUAGE plpgsql
    AS $$
begin
  return query
  with dates as (
    select d::date as dt
    from generate_series(p_start_date, p_end_date, '1 day'::interval) d
  ),
  working_staff as (
    select d.dt, count(distinct s.id)::bigint as total
    from dates d
    cross join staff s
    left join staff_time_off sto
      on sto.staff_id = s.id
      and d.dt between sto.starts_at::date and sto.ends_at::date
    where s.archived_at is null
      and sto.id is null
    group by d.dt
  ),
  appointments_agg as (
    select
      a.starts_at::date as dt,
      count(*) filter (where
        case
          when a.starts_at::date >= current_date then
            a.status in ('pending', 'confirmed')
          else
            a.status in ('confirmed', 'completed')
        end
      ) as filled,
      count(*) filter (where a.status = 'cancelled') as cancelled,
      count(*) filter (where a.status = 'no_show') as noshow
    from appointments a
    where a.starts_at::date between p_start_date and p_end_date
    group by a.starts_at::date
  )
  select
    d.dt,
    coalesce(a.filled, 0)     as filled_slots,
    coalesce(a.cancelled, 0)  as cancellations,
    coalesce(a.noshow, 0)     as no_shows,
    coalesce(ws.total, 0)     as staff_working
  from dates d
  left join appointments_agg a on a.dt = d.dt
  left join working_staff ws   on ws.dt = d.dt
  order by d.dt;
end;
$$;


ALTER FUNCTION public.get_occupancy_rate_report(p_start_date date, p_end_date date) OWNER TO postgres;

--
-- Name: get_operational_overview(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_operational_overview(p_start_date date, p_end_date date) RETURNS TABLE(total_appointments bigint, confirmed_appointments bigint, completed_appointments bigint, cancelled_appointments bigint, no_show_appointments bigint, pending_appointments bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_appointments,
    COUNT(*) FILTER (WHERE status = 'confirmed')::BIGINT AS confirmed_appointments,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT AS completed_appointments,
    COUNT(*) FILTER (WHERE status = 'cancelled')::BIGINT AS cancelled_appointments,
    COUNT(*) FILTER (WHERE status = 'no_show')::BIGINT AS no_show_appointments,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT AS pending_appointments
  FROM appointments
  WHERE starts_at >= p_start_date
    AND starts_at < (p_end_date + INTERVAL '1 day');
END;
$$;


ALTER FUNCTION public.get_operational_overview(p_start_date date, p_end_date date) OWNER TO postgres;

--
-- Name: get_revenue_by_service_report(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_revenue_by_service_report(p_start_date date, p_end_date date) RETURNS TABLE(service_id uuid, service_name text, service_category text, quantity bigint, revenue numeric, percentage numeric)
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  WITH booked_services AS (
    SELECT
      pas.service_id,
      pas.quantity,
      pas.price
    FROM public.appointment_services pas
    JOIN public.appointments a ON a.id = pas.appointment_id
    WHERE a.status IN ('completed', 'confirmed')
      AND a.starts_at >= p_start_date
      AND a.starts_at < (p_end_date + INTERVAL '1 day')
  ),
  service_totals AS (
    SELECT
      s.id,
      s.name,
      s.category,
      COALESCE(SUM(bs.quantity), 0)::BIGINT AS quantity,
      COALESCE(SUM(bs.price * bs.quantity), 0) AS revenue
    FROM public.services s
    LEFT JOIN booked_services bs ON bs.service_id = s.id
    WHERE s.is_active = true
    GROUP BY s.id, s.name, s.category
  ),
  grand_total AS (
    SELECT COALESCE(SUM(st.revenue), 0) AS total FROM service_totals st
  )
  SELECT
    st.id       AS service_id,
    st.name     AS service_name,
    st.category AS service_category,
    st.quantity,
    st.revenue,
    CASE WHEN gt.total > 0
      THEN ROUND((st.revenue / gt.total * 100)::NUMERIC, 2)
      ELSE 0
    END AS percentage
  FROM service_totals st, grand_total gt
  ORDER BY st.revenue DESC;
END;
$$;


ALTER FUNCTION public.get_revenue_by_service_report(p_start_date date, p_end_date date) OWNER TO postgres;

--
-- Name: get_staff_performance_report(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_staff_performance_report(p_start_date date, p_end_date date) RETURNS TABLE(staff_id uuid, staff_name text, staff_color text, staff_avatar_url text, working_hours jsonb, revenue numeric, commission numeric, appointments_count bigint, total_booked_minutes numeric)
    LANGUAGE plpgsql
    AS $$
begin
  return query
  with staff_appointments as (
    select
      a.staff_id,
      count(a.id)::bigint as appointments_count,
      coalesce(sum(a.price), 0) as revenue,
      coalesce(sum(extract(epoch from a.ends_at - a.starts_at) / 60), 0) as total_booked_minutes
    from appointments a
    where
      (
        (a.starts_at::date >= current_date and a.status in ('pending', 'confirmed'))
        or
        (a.starts_at::date < current_date and a.status in ('confirmed', 'completed'))
      )
      and a.starts_at >= p_start_date
      and a.starts_at < (p_end_date + interval '1 day')
    group by a.staff_id
  ),
  staff_commissions as (
    select
      ft.staff_id,
      coalesce(sum(ft.commission_value), 0) as commission
    from finance_transactions ft
    where ft.staff_id is not null
      and ft.commission_value > 0
      and ft.occurred_at >= p_start_date
      and ft.occurred_at < (p_end_date + interval '1 day')
    group by ft.staff_id
  )
  select
    s.id as staff_id,
    s.full_name as staff_name,
    s.color as staff_color,
    null::text as staff_avatar_url,
    s.working_hours,
    coalesce(sa.revenue, 0) as revenue,
    coalesce(sc.commission, 0) as commission,
    coalesce(sa.appointments_count, 0)::bigint as appointments_count,
    coalesce(sa.total_booked_minutes, 0) as total_booked_minutes
  from staff s
  left join staff_appointments sa on sa.staff_id = s.id
  left join staff_commissions sc on sc.staff_id = s.id
  where s.archived_at is null
  order by revenue desc;
end;
$$;


ALTER FUNCTION public.get_staff_performance_report(p_start_date date, p_end_date date) OWNER TO postgres;

--
-- Name: get_top_products_report(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_top_products_report(p_start_date date, p_end_date date) RETURNS TABLE(product_id uuid, product_name text, quantity bigint, revenue numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    si.item_id   AS product_id,
    si.item_name AS product_name,
    COALESCE(SUM(si.quantity), 0)::BIGINT AS quantity,
    COALESCE(SUM(si.total_price), 0)      AS revenue
  FROM sale_items si
  JOIN sales s ON s.id = si.sale_id
  WHERE si.item_type = 'product'
    AND s.status = 'completed'
    AND s.created_at >= p_start_date
    AND s.created_at < (p_end_date + INTERVAL '1 day')
  GROUP BY si.item_id, si.item_name
  ORDER BY revenue DESC;
END;
$$;


ALTER FUNCTION public.get_top_products_report(p_start_date date, p_end_date date) OWNER TO postgres;

--
-- Name: handle_appointment_lifecycle(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_appointment_lifecycle() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_service_name text;
begin
  if NEW.status = 'completed' and NEW.payment_method_id is null then
    raise exception '[business] Nao e possivel concluir o atendimento sem forma de pagamento.'
      using errcode = 'P0001';
  end if;

  -- INSERT
  if TG_OP = 'INSERT' then
    if NEW.status = 'completed' then
      -- REMOVIDO: insert em finance_transactions (agora só via finalize_sale)
      perform public.recalc_client_aggregates(NEW.client_id);
    end if;
    return NEW;
  end if;

  -- UPDATE
  if TG_OP = 'UPDATE' then
    if NEW.status = 'completed' and OLD.status is distinct from 'completed' then
      -- REMOVIDO: insert em finance_transactions (agora só via finalize_sale)
      perform public.recalc_client_aggregates(NEW.client_id);

    elsif OLD.status = 'completed' and NEW.status in ('cancelled', 'no_show') then
      -- Se desfizer conclusão, remove a transação financeira que veio da venda
      delete from public.finance_transactions
      where appointment_id = NEW.id and type = 'income' and category = 'service';
      perform public.recalc_client_aggregates(NEW.client_id);

    elsif NEW.status = 'completed' and OLD.status = 'completed' then
      -- Atualiza valor se mudou (ex: reabriu e concluiu de novo)
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
$$;


ALTER FUNCTION public.handle_appointment_lifecycle() OWNER TO postgres;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_full_name   text;
  v_email       text;
  v_phone       text;
  v_phone_norm  text;
  v_meta_client uuid;
  v_matched     uuid;
begin
  v_email      := coalesce(new.email, '');
  v_full_name  := nullif(new.raw_user_meta_data ->> 'full_name', '');
  v_phone      := nullif(new.raw_user_meta_data ->> 'phone', '');
  v_phone_norm := public.normalize_phone_br(v_phone);

  insert into public.profiles (id, email, full_name, role)
  values (new.id, v_email, v_full_name, 'client')
  on conflict (id) do nothing;

  -- Convite de profissional (staff/admin): não cria nem vincula clients.
  if (new.raw_user_meta_data ->> 'is_staff_invite') = 'true' then
    return new;
  end if;

  v_meta_client := nullif(new.raw_user_meta_data ->> 'client_id', '')::uuid;

  if v_meta_client is not null then
    update public.clients
       set profile_id = new.id,
           updated_at = now()
     where id = v_meta_client
       and profile_id is null;
    return new;
  end if;

  select id into v_matched
    from public.clients
   where profile_id is null
     and (
       (v_email <> '' and lower(email) = lower(v_email))
       or (v_phone_norm is not null and phone = v_phone_norm)
     )
   order by (lower(email) = lower(v_email)) desc
   limit 1;

  if v_matched is not null then
    update public.clients
       set profile_id = new.id,
           full_name  = coalesce(full_name, v_full_name),
           email      = coalesce(email, nullif(v_email, '')),
           phone      = coalesce(phone, v_phone_norm),
           updated_at = now()
     where id = v_matched;
  else
    insert into public.clients (profile_id, full_name, email, phone)
    values (new.id, v_full_name, nullif(v_email, ''), v_phone_norm);
  end if;

  return new;
end;
$$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: maintain_client_metrics(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.maintain_client_metrics() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
DECLARE
  _client_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _client_id := NEW.client_id;
  ELSIF TG_OP IN ('UPDATE', 'DELETE') THEN
    _client_id := OLD.client_id;
  END IF;

  UPDATE public.clients c SET
    first_visit  = sub.first_visit,
    last_visit   = sub.last_visit,
    total_visits = sub.total_visits,
    total_spent  = sub.total_spent,
    frequency_days = sub.frequency_days
  FROM (
    SELECT
      MIN(a.starts_at)                                                             AS first_visit,
      MAX(a.starts_at) FILTER (WHERE a.starts_at <= NOW())                         AS last_visit,
      COUNT(*)                                                                     AS total_visits,
      COALESCE(SUM(a.price), 0)                                                    AS total_spent,
      CASE
        WHEN COUNT(*) >= 2 THEN
          ROUND(EXTRACT(EPOCH FROM MAX(a.starts_at) - MIN(a.starts_at)) / 86400 / NULLIF(COUNT(*) - 1, 0))
        ELSE NULL
      END                                                                          AS frequency_days
    FROM appointments a
    WHERE a.client_id = _client_id AND a.status != 'cancelled'
  ) sub
  WHERE c.id = _client_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION public.maintain_client_metrics() OWNER TO postgres;

--
-- Name: normalize_phone_before_write(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.normalize_phone_before_write() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare v_norm text; begin if NEW.phone is null then return NEW; end if; v_norm := public.normalize_phone_br(NEW.phone); if v_norm is null then raise exception '[business] Telefone invalido. Use DDD + numero (ex: 11 99999-9999).' using errcode = 'P0001'; end if; NEW.phone := v_norm; return NEW; end;
$$;


ALTER FUNCTION public.normalize_phone_before_write() OWNER TO postgres;

--
-- Name: normalize_phone_br(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.normalize_phone_br(p_raw text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    SET search_path TO 'public'
    AS $$
declare
  v_digits   text;
  v_national text;
  v_ddd      int;
begin
  v_digits := regexp_replace(coalesce(p_raw, ''), '\D', '', 'g');

  if length(v_digits) = 0 then
    return null;
  end if;

  v_national := v_digits;
  if left(v_national, 2) = '55' and length(v_national) in (12, 13) then
    v_national := substr(v_national, 3);
  end if;

  if length(v_national) not in (10, 11) then
    return null;
  end if;

  v_ddd := substr(v_national, 1, 2)::int;
  if v_ddd < 11 or v_ddd > 99 then
    return null;
  end if;

  if length(v_national) = 11 and substr(v_national, 3, 1) <> '9' then
    return null;
  end if;

  return '+55' || v_national;
end;
$$;


ALTER FUNCTION public.normalize_phone_br(p_raw text) OWNER TO postgres;

--
-- Name: recalc_client_aggregates(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.recalc_client_aggregates(p_client_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin update public.clients c set total_appointments = agg.cnt, total_spent        = agg.total, last_visit_at      = agg.last_visit, updated_at         = now() from ( select count(*)::int                  as cnt, coalesce(sum(price), 0)::numeric as total, max(ends_at)                   as last_visit from public.appointments where client_id = p_client_id and status = 'completed' ) as agg where c.id = p_client_id; end;
$$;


ALTER FUNCTION public.recalc_client_aggregates(p_client_id uuid) OWNER TO postgres;

--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION public.rls_auto_enable() OWNER TO postgres;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin new.updated_at = now(); return new; end;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

--
-- Name: settle_commissions(uuid[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.settle_commissions(p_transaction_ids uuid[]) RETURNS TABLE(staff_id uuid, total_settled numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
declare
  v_user_id uuid;
begin
  -- Pega o usuário logado (via RLS)
  v_user_id := auth.uid();

  -- 1. Atualiza settled_at e settled_by nas transações de comissão
  update finance_transactions
  set
    settled_at = now(),
    settled_by = v_user_id
  where id = any(p_transaction_ids)
    and settled_at is null
    and type = 'income'::transaction_type
    and finance_transactions.staff_id is not null;

  -- 2. Insere 1 despesa por staff com o total da comissão acertada
  insert into finance_transactions (
    type, category, amount, description,
    staff_id, occurred_at, created_by
  )
  select
    'expense'::transaction_type,
    'commission'::transaction_category,
    sum(ft.commission_value),
    'Acerto de comissão - ' || coalesce(s.full_name, 'Profissional'),
    ft.staff_id,
    now(),
    v_user_id
  from finance_transactions ft
  left join staff s on s.id = ft.staff_id
  where ft.id = any(p_transaction_ids)
    and ft.type = 'income'::transaction_type
    and ft.staff_id is not null
  group by ft.staff_id, s.full_name;

  -- 3. Retorna resumo do que foi processado
  return query
  select
    ft.staff_id,
    sum(ft.commission_value)::numeric as total_settled
  from finance_transactions ft
  where ft.id = any(p_transaction_ids)
    and ft.type = 'income'::transaction_type
    and ft.staff_id is not null
  group by ft.staff_id;
end;
$$;


ALTER FUNCTION public.settle_commissions(p_transaction_ids uuid[]) OWNER TO postgres;

--
-- Name: update_appointment_multi_service(uuid, uuid, uuid, timestamp with time zone, jsonb, text, public.appointment_status); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_appointment_multi_service(p_appointment_id uuid, p_client_id uuid, p_staff_id uuid, p_starts_at timestamp with time zone, p_services jsonb, p_notes text DEFAULT NULL::text, p_status public.appointment_status DEFAULT NULL::public.appointment_status) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_total_duration int := 0;
  v_total_price numeric := 0;
  v_svc jsonb;
  v_service_id uuid;
  v_qty int;
  v_dur int;
  v_price numeric;
  v_name text;
  v_ends_at timestamptz;
BEGIN
  IF p_services IS NULL OR jsonb_array_length(p_services) = 0 THEN
    RAISE EXCEPTION 'Informe ao menos um serviço';
  END IF;

  FOR v_svc IN SELECT * FROM jsonb_array_elements(p_services) LOOP
    v_service_id := (v_svc->>'serviceId')::uuid;
    v_qty := GREATEST(COALESCE((v_svc->>'quantity')::int, 1), 1);

    SELECT s.duration_minutes, s.price, s.name
      INTO v_dur, v_price, v_name
      FROM public.services s
     WHERE s.id = v_service_id AND s.is_active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Serviço inválido ou inativo: %', v_service_id;
    END IF;

    v_total_duration := v_total_duration + (v_dur * v_qty);
    v_total_price   := v_total_price   + (v_price * v_qty);
  END LOOP;

  v_ends_at := p_starts_at + (v_total_duration || ' minutes')::interval;

  UPDATE public.appointments
     SET client_id = p_client_id,
         staff_id  = p_staff_id,
         starts_at = p_starts_at,
         ends_at   = v_ends_at,
         status    = COALESCE(p_status, status),
         price     = v_total_price,
         notes     = p_notes
   WHERE id = p_appointment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Agendamento não encontrado';
  END IF;

  DELETE FROM public.appointment_services WHERE appointment_id = p_appointment_id;

  FOR v_svc IN SELECT * FROM jsonb_array_elements(p_services) LOOP
    v_service_id := (v_svc->>'serviceId')::uuid;
    v_qty := GREATEST(COALESCE((v_svc->>'quantity')::int, 1), 1);

    SELECT s.duration_minutes, s.price, s.name
      INTO v_dur, v_price, v_name
      FROM public.services s
     WHERE s.id = v_service_id;

    INSERT INTO public.appointment_services
      (appointment_id, service_id, service_name, duration_minutes, price, quantity)
    VALUES
      (p_appointment_id, v_service_id, v_name, v_dur, v_price, v_qty);
  END LOOP;
END;
$$;


ALTER FUNCTION public.update_appointment_multi_service(p_appointment_id uuid, p_client_id uuid, p_staff_id uuid, p_starts_at timestamp with time zone, p_services jsonb, p_notes text, p_status public.appointment_status) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointment_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    service_id uuid NOT NULL,
    service_name text NOT NULL,
    duration_minutes integer NOT NULL,
    price numeric NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.appointment_services OWNER TO postgres;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    staff_id uuid NOT NULL,
    service_id uuid,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    status public.appointment_status DEFAULT 'pending'::public.appointment_status NOT NULL,
    price numeric(10,2) NOT NULL,
    notes text,
    cancelled_at timestamp with time zone,
    cancelled_reason text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    payment_method_id uuid,
    CONSTRAINT chk_ends_after_starts CHECK ((ends_at > starts_at))
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: client_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    event_type text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.client_events OWNER TO postgres;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid,
    birth_date date,
    notes text,
    preferences jsonb DEFAULT '{}'::jsonb,
    total_appointments integer DEFAULT 0 NOT NULL,
    total_spent numeric(10,2) DEFAULT 0 NOT NULL,
    last_visit_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    full_name text,
    phone text,
    email text,
    cpf text,
    address jsonb,
    tags jsonb DEFAULT '[]'::jsonb,
    avatar_url text,
    first_visit timestamp with time zone,
    last_visit timestamp with time zone,
    total_visits integer DEFAULT 0,
    status text DEFAULT 'active'::text,
    frequency_days integer,
    external_id text,
    CONSTRAINT clients_has_identity CHECK (((profile_id IS NOT NULL) OR ((full_name IS NOT NULL) AND (length(TRIM(BOTH FROM full_name)) > 0))))
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: COLUMN clients.full_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.clients.full_name IS 'Nome do cliente walk-in (sem conta). NULL se cliente tem profile_id.';


--
-- Name: COLUMN clients.phone; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.clients.phone IS 'Telefone do cliente walk-in. Para clientes com conta, usar profiles.phone.';


--
-- Name: COLUMN clients.email; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.clients.email IS 'Email do cliente walk-in (opcional). Para clientes com conta, usar profiles.email.';


--
-- Name: CONSTRAINT clients_has_identity ON clients; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT clients_has_identity ON public.clients IS 'Garante que todo cliente tenha identidade: ou profile_id (logado) ou full_name (walk-in).';


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    role public.user_role DEFAULT 'client'::public.user_role NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: clients_view; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.clients_view WITH (security_invoker='true', security_barrier='true') AS
 SELECT c.id,
    c.profile_id,
        CASE
            WHEN (c.profile_id IS NOT NULL) THEN 'account'::text
            ELSE 'walkin'::text
        END AS origin,
    COALESCE(c.full_name, p.full_name) AS display_name,
    c.phone AS display_phone,
    COALESCE(c.email, p.email) AS display_email,
    c.birth_date,
    c.notes,
    c.preferences,
    c.total_appointments,
    c.total_spent,
    c.last_visit_at,
    c.created_at,
    c.updated_at,
    c.full_name AS raw_full_name,
    c.phone AS raw_phone,
    c.email AS raw_email,
    p.full_name AS profile_full_name,
    p.email AS profile_email
   FROM (public.clients c
     LEFT JOIN public.profiles p ON ((p.id = c.profile_id)));


ALTER VIEW public.clients_view OWNER TO postgres;

--
-- Name: crm_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crm_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    task_type public.task_type_enum NOT NULL,
    reference_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid
);


ALTER TABLE public.crm_logs OWNER TO postgres;

--
-- Name: finance_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.finance_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type public.transaction_type NOT NULL,
    category public.transaction_category NOT NULL,
    amount numeric(10,2) NOT NULL,
    description text,
    appointment_id uuid,
    staff_id uuid,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    payment_method_id uuid,
    reference_id uuid,
    commission_value numeric DEFAULT 0 NOT NULL,
    settled_at timestamp with time zone,
    settled_by uuid,
    CONSTRAINT finance_transactions_amount_check CHECK ((amount > (0)::numeric))
);


ALTER TABLE public.finance_transactions OWNER TO postgres;

--
-- Name: leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    message text,
    source public.lead_source DEFAULT 'landing'::public.lead_source NOT NULL,
    status public.lead_status DEFAULT 'new'::public.lead_status NOT NULL,
    service_interest_id uuid,
    converted_client_id uuid,
    contacted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.leads OWNER TO postgres;

--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_methods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    icon text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.payment_methods OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    price numeric(10,2) NOT NULL,
    avatar_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    department text,
    commission_rate numeric DEFAULT 0
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sale_id uuid,
    item_type text NOT NULL,
    item_id uuid,
    item_name text NOT NULL,
    quantity integer DEFAULT 1,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    is_locked boolean DEFAULT false
);


ALTER TABLE public.sale_items OWNER TO postgres;

--
-- Name: sale_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sale_id uuid,
    payment_method_id uuid,
    amount numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.sale_payments OWNER TO postgres;

--
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sale_type text DEFAULT 'product'::text NOT NULL,
    appointment_id uuid,
    client_name text NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.sales OWNER TO postgres;

--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    duration_minutes integer NOT NULL,
    price numeric(10,2) NOT NULL,
    category text,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT services_duration_minutes_check CHECK ((duration_minutes > 0)),
    CONSTRAINT services_price_check CHECK ((price >= (0)::numeric))
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid,
    specialty text,
    bio text,
    commission_rate numeric(5,2) DEFAULT 0,
    is_bookable boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    working_hours jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    full_name text,
    phone text,
    archived_at timestamp with time zone,
    color text
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- Name: staff_time_off; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_time_off (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    staff_id uuid NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    CONSTRAINT staff_time_off_valid_range CHECK ((ends_at > starts_at))
);


ALTER TABLE public.staff_time_off OWNER TO postgres;

--
-- Name: TABLE staff_time_off; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.staff_time_off IS 'Bloqueios de agenda por profissional (folga, ferias, intervalo).';


--
-- Name: appointment_services appointment_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: client_events client_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_events
    ADD CONSTRAINT client_events_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: clients clients_profile_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_profile_id_key UNIQUE (profile_id);


--
-- Name: crm_logs crm_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_logs
    ADD CONSTRAINT crm_logs_pkey PRIMARY KEY (id);


--
-- Name: finance_transactions finance_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finance_transactions
    ADD CONSTRAINT finance_transactions_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: appointments no_overlap_per_staff; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT no_overlap_per_staff EXCLUDE USING gist (staff_id WITH =, tstzrange(starts_at, ends_at, '[)'::text) WITH &&) WHERE ((status <> ALL (ARRAY['cancelled'::public.appointment_status, 'no_show'::public.appointment_status])));


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sale_payments sale_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_payments
    ADD CONSTRAINT sale_payments_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: staff staff_profile_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_profile_id_key UNIQUE (profile_id);


--
-- Name: staff_time_off staff_time_off_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_time_off
    ADD CONSTRAINT staff_time_off_pkey PRIMARY KEY (id);


--
-- Name: clients_email_unique_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX clients_email_unique_idx ON public.clients USING btree (lower(email)) WHERE (email IS NOT NULL);


--
-- Name: clients_phone_unique_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX clients_phone_unique_idx ON public.clients USING btree (phone) WHERE (phone IS NOT NULL);


--
-- Name: idx_appointment_services_appointment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_services_appointment ON public.appointment_services USING btree (appointment_id);


--
-- Name: idx_appointment_services_appointment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_services_appointment_id ON public.appointment_services USING btree (appointment_id);


--
-- Name: idx_appointment_services_service; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_services_service ON public.appointment_services USING btree (service_id);


--
-- Name: idx_appointments_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_client ON public.appointments USING btree (client_id);


--
-- Name: idx_appointments_staff; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_staff ON public.appointments USING btree (staff_id);


--
-- Name: idx_appointments_staff_starts; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_staff_starts ON public.appointments USING btree (staff_id, starts_at);


--
-- Name: idx_appointments_starts; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_starts ON public.appointments USING btree (starts_at);


--
-- Name: idx_appointments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);


--
-- Name: idx_client_events_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_events_client ON public.client_events USING btree (client_id, occurred_at DESC);


--
-- Name: idx_clients_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_email ON public.clients USING btree (lower(email)) WHERE (email IS NOT NULL);


--
-- Name: idx_clients_external_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_external_id ON public.clients USING btree (external_id);


--
-- Name: idx_clients_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_phone ON public.clients USING btree (phone) WHERE (phone IS NOT NULL);


--
-- Name: idx_clients_profile; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_profile ON public.clients USING btree (profile_id);


--
-- Name: idx_crm_logs_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_crm_logs_client_id ON public.crm_logs USING btree (client_id);


--
-- Name: idx_crm_logs_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_crm_logs_created_by ON public.crm_logs USING btree (created_by);


--
-- Name: idx_crm_logs_reference_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_crm_logs_reference_date ON public.crm_logs USING btree (reference_date);


--
-- Name: idx_crm_logs_task_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_crm_logs_task_type ON public.crm_logs USING btree (task_type);


--
-- Name: idx_finance_appointment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_finance_appointment ON public.finance_transactions USING btree (appointment_id);


--
-- Name: idx_finance_occurred; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_finance_occurred ON public.finance_transactions USING btree (occurred_at DESC);


--
-- Name: idx_finance_transactions_settled; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_finance_transactions_settled ON public.finance_transactions USING btree (staff_id, settled_at NULLS FIRST);


--
-- Name: idx_finance_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_finance_type ON public.finance_transactions USING btree (type);


--
-- Name: idx_leads_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leads_created ON public.leads USING btree (created_at DESC);


--
-- Name: idx_leads_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leads_status ON public.leads USING btree (status);


--
-- Name: idx_profiles_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);


--
-- Name: idx_profiles_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);


--
-- Name: idx_services_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_active ON public.services USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_services_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_category ON public.services USING btree (category);


--
-- Name: idx_staff_bookable; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_bookable ON public.staff USING btree (is_bookable) WHERE (is_bookable = true);


--
-- Name: idx_staff_profile; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_profile ON public.staff USING btree (profile_id);


--
-- Name: idx_staff_time_off_staff_range; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_time_off_staff_range ON public.staff_time_off USING btree (staff_id, starts_at, ends_at);


--
-- Name: staff_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX staff_active_idx ON public.staff USING btree (display_order) WHERE (archived_at IS NULL);


--
-- Name: appointments trg_appointment_conflict; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_appointment_conflict BEFORE INSERT OR UPDATE OF staff_id, starts_at, ends_at, status ON public.appointments FOR EACH ROW WHEN ((new.status = ANY (ARRAY['pending'::public.appointment_status, 'confirmed'::public.appointment_status, 'completed'::public.appointment_status]))) EXECUTE FUNCTION public.check_appointment_conflict();


--
-- Name: appointments trg_appointment_lifecycle; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_appointment_lifecycle AFTER INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_appointment_lifecycle();


--
-- Name: appointments trg_appointments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: clients trg_clients_normalize_phone; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_clients_normalize_phone BEFORE INSERT OR UPDATE OF phone ON public.clients FOR EACH ROW EXECUTE FUNCTION public.normalize_phone_before_write();


--
-- Name: clients trg_clients_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: finance_transactions trg_finance_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_finance_updated_at BEFORE UPDATE ON public.finance_transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: leads trg_leads_normalize_phone; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_leads_normalize_phone BEFORE INSERT OR UPDATE OF phone ON public.leads FOR EACH ROW EXECUTE FUNCTION public.normalize_phone_before_write();


--
-- Name: leads trg_leads_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: appointments trg_maintain_client_metrics; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_maintain_client_metrics AFTER INSERT OR DELETE OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.maintain_client_metrics();


--
-- Name: profiles trg_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: services trg_services_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: staff trg_staff_normalize_phone; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_staff_normalize_phone BEFORE INSERT OR UPDATE OF phone ON public.staff FOR EACH ROW EXECUTE FUNCTION public.normalize_phone_before_write();


--
-- Name: staff_time_off trg_staff_time_off_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_staff_time_off_updated_at BEFORE UPDATE ON public.staff_time_off FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: staff trg_staff_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: appointment_services appointment_services_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: appointment_services appointment_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: appointments appointments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: appointments appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE RESTRICT;


--
-- Name: appointments appointments_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE RESTRICT;


--
-- Name: client_events client_events_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_events
    ADD CONSTRAINT client_events_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: clients clients_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: crm_logs crm_logs_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_logs
    ADD CONSTRAINT crm_logs_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: crm_logs crm_logs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_logs
    ADD CONSTRAINT crm_logs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: finance_transactions finance_transactions_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finance_transactions
    ADD CONSTRAINT finance_transactions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;


--
-- Name: finance_transactions finance_transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finance_transactions
    ADD CONSTRAINT finance_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: finance_transactions finance_transactions_settled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finance_transactions
    ADD CONSTRAINT finance_transactions_settled_by_fkey FOREIGN KEY (settled_by) REFERENCES public.profiles(id);


--
-- Name: finance_transactions finance_transactions_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finance_transactions
    ADD CONSTRAINT finance_transactions_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- Name: leads leads_converted_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_converted_client_id_fkey FOREIGN KEY (converted_client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: leads leads_service_interest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_service_interest_id_fkey FOREIGN KEY (service_interest_id) REFERENCES public.services(id) ON DELETE SET NULL;


--
-- Name: sale_items sale_items_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- Name: sale_payments sale_payments_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_payments
    ADD CONSTRAINT sale_payments_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- Name: sales sales_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;


--
-- Name: sales sales_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: staff staff_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: staff_time_off staff_time_off_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_time_off
    ADD CONSTRAINT staff_time_off_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: staff_time_off staff_time_off_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_time_off
    ADD CONSTRAINT staff_time_off_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- Name: client_events Gestão administrativa; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Gestão administrativa" ON public.client_events USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: crm_logs Gestão administrativa; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Gestão administrativa" ON public.crm_logs USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: payment_methods Gestão administrativa; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Gestão administrativa" ON public.payment_methods USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: products Gestão administrativa; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Gestão administrativa" ON public.products USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: sale_items Gestão administrativa; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Gestão administrativa" ON public.sale_items USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: sale_payments Gestão administrativa; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Gestão administrativa" ON public.sale_payments USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: sales Gestão administrativa; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Gestão administrativa" ON public.sales USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: appointment_services; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;

--
-- Name: appointment_services appointment_services_admin_staff_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointment_services_admin_staff_all ON public.appointment_services USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role]))) WITH CHECK ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: appointment_services appointment_services_select_own_client; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointment_services_select_own_client ON public.appointment_services FOR SELECT USING ((appointment_id IN ( SELECT a.id
   FROM public.appointments a
  WHERE (a.client_id IN ( SELECT c.id
           FROM public.clients c
          WHERE (c.profile_id = auth.uid()))))));


--
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

--
-- Name: appointments appointments_delete_staff_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_delete_staff_admin ON public.appointments FOR DELETE TO authenticated USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: appointments appointments_insert_client; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_insert_client ON public.appointments FOR INSERT WITH CHECK (((client_id IN ( SELECT clients.id
   FROM public.clients
  WHERE (clients.profile_id = auth.uid()))) AND (status = 'pending'::public.appointment_status)));


--
-- Name: appointments appointments_insert_staff_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_insert_staff_admin ON public.appointments FOR INSERT WITH CHECK ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: appointments appointments_select_own_client; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_select_own_client ON public.appointments FOR SELECT TO authenticated USING ((client_id IN ( SELECT c.id
   FROM public.clients c
  WHERE (c.profile_id = auth.uid()))));


--
-- Name: appointments appointments_select_staff_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_select_staff_admin ON public.appointments FOR SELECT TO authenticated USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: appointments appointments_update_own_client; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_update_own_client ON public.appointments FOR UPDATE USING ((client_id IN ( SELECT clients.id
   FROM public.clients
  WHERE (clients.profile_id = auth.uid()))));


--
-- Name: appointments appointments_update_staff_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_update_staff_admin ON public.appointments FOR UPDATE TO authenticated USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role]))) WITH CHECK ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: client_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.client_events ENABLE ROW LEVEL SECURITY;

--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: clients clients_insert_self; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY clients_insert_self ON public.clients FOR INSERT WITH CHECK ((profile_id = auth.uid()));


--
-- Name: clients clients_insert_staff_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY clients_insert_staff_admin ON public.clients FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role]))))));


--
-- Name: clients clients_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY clients_select_own ON public.clients FOR SELECT USING ((profile_id = auth.uid()));


--
-- Name: clients clients_select_staff_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY clients_select_staff_admin ON public.clients FOR SELECT USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: clients clients_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY clients_update_own ON public.clients FOR UPDATE USING ((profile_id = auth.uid()));


--
-- Name: clients clients_update_staff_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY clients_update_staff_admin ON public.clients FOR UPDATE USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: crm_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.crm_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: finance_transactions finance_all_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY finance_all_admin ON public.finance_transactions USING ((public.current_user_role() = 'admin'::public.user_role)) WITH CHECK ((public.current_user_role() = 'admin'::public.user_role));


--
-- Name: finance_transactions finance_insert_staff; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY finance_insert_staff ON public.finance_transactions FOR INSERT WITH CHECK ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: finance_transactions finance_select_own_staff; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY finance_select_own_staff ON public.finance_transactions FOR SELECT USING ((staff_id IN ( SELECT staff.id
   FROM public.staff
  WHERE (staff.profile_id = auth.uid()))));


--
-- Name: finance_transactions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: leads; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

--
-- Name: leads leads_insert_public; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY leads_insert_public ON public.leads FOR INSERT WITH CHECK (true);


--
-- Name: leads leads_select_staff_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY leads_select_staff_admin ON public.leads FOR SELECT USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: leads leads_update_staff_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY leads_update_staff_admin ON public.leads FOR UPDATE USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: payment_methods; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: products products_delete_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY products_delete_admin ON public.products FOR DELETE USING ((public.current_user_role() = 'admin'::public.user_role));


--
-- Name: products products_insert_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY products_insert_admin ON public.products FOR INSERT WITH CHECK ((public.current_user_role() = 'admin'::public.user_role));


--
-- Name: products products_select_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY products_select_admin ON public.products FOR SELECT USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: products products_select_public; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY products_select_public ON public.products FOR SELECT USING ((is_active = true));


--
-- Name: products products_update_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY products_update_admin ON public.products FOR UPDATE USING ((public.current_user_role() = 'admin'::public.user_role));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_select_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_select_admin ON public.profiles FOR SELECT USING ((public.current_user_role() = 'admin'::public.user_role));


--
-- Name: profiles profiles_select_client_staff_bookable; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_select_client_staff_bookable ON public.profiles FOR SELECT TO authenticated USING (((public.current_user_role() = 'client'::public.user_role) AND (id IN ( SELECT staff.profile_id
   FROM public.staff
  WHERE (staff.is_bookable = true)))));


--
-- Name: profiles profiles_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: profiles profiles_select_staff_clients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_select_staff_clients ON public.profiles FOR SELECT USING (((public.current_user_role() = 'staff'::public.user_role) AND (role = 'client'::public.user_role)));


--
-- Name: profiles profiles_select_team; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_select_team ON public.profiles FOR SELECT TO authenticated USING (((public.current_user_role() = 'staff'::public.user_role) AND (role = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role]))));


--
-- Name: profiles profiles_update_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_update_admin ON public.profiles FOR UPDATE USING ((public.current_user_role() = 'admin'::public.user_role));


--
-- Name: profiles profiles_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING ((auth.uid() = id)) WITH CHECK (((auth.uid() = id) AND (role = ( SELECT profiles_1.role
   FROM public.profiles profiles_1
  WHERE (profiles_1.id = auth.uid())))));


--
-- Name: sale_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

--
-- Name: sale_payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.sale_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: sales; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

--
-- Name: services; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

--
-- Name: services services_delete_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY services_delete_admin ON public.services FOR DELETE USING ((public.current_user_role() = 'admin'::public.user_role));


--
-- Name: services services_insert_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY services_insert_admin ON public.services FOR INSERT WITH CHECK ((public.current_user_role() = 'admin'::public.user_role));


--
-- Name: services services_select_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY services_select_admin ON public.services FOR SELECT USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: services services_select_public; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY services_select_public ON public.services FOR SELECT USING ((is_active = true));


--
-- Name: services services_update_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY services_update_admin ON public.services FOR UPDATE USING ((public.current_user_role() = 'admin'::public.user_role));


--
-- Name: staff; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

--
-- Name: staff staff_admin_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_admin_update ON public.staff FOR UPDATE USING ((public.current_user_role() = 'admin'::public.user_role)) WITH CHECK ((public.current_user_role() = 'admin'::public.user_role));


--
-- Name: staff staff_delete_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_delete_admin ON public.staff FOR DELETE USING ((public.current_user_role() = 'admin'::public.user_role));


--
-- Name: staff staff_insert_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_insert_admin ON public.staff FOR INSERT WITH CHECK ((public.current_user_role() = 'admin'::public.user_role));


--
-- Name: staff staff_select_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_select_admin ON public.staff FOR SELECT USING ((public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'staff'::public.user_role])));


--
-- Name: staff staff_select_public; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_select_public ON public.staff FOR SELECT USING ((is_bookable = true));


--
-- Name: staff_time_off; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.staff_time_off ENABLE ROW LEVEL SECURITY;

--
-- Name: staff_time_off staff_time_off_admin_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_time_off_admin_all ON public.staff_time_off USING ((public.current_user_role() = 'admin'::public.user_role)) WITH CHECK ((public.current_user_role() = 'admin'::public.user_role));


--
-- Name: staff_time_off staff_time_off_read_all_authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_time_off_read_all_authenticated ON public.staff_time_off FOR SELECT TO authenticated USING (true);


--
-- Name: staff_time_off staff_time_off_self_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_time_off_self_delete ON public.staff_time_off FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.id = staff_time_off.staff_id) AND (s.profile_id = auth.uid())))));


--
-- Name: staff_time_off staff_time_off_self_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_time_off_self_insert ON public.staff_time_off FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.id = staff_time_off.staff_id) AND (s.profile_id = auth.uid())))));


--
-- Name: staff_time_off staff_time_off_self_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_time_off_self_select ON public.staff_time_off FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.id = staff_time_off.staff_id) AND (s.profile_id = auth.uid())))));


--
-- Name: staff_time_off staff_time_off_self_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_time_off_self_update ON public.staff_time_off FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.id = staff_time_off.staff_id) AND (s.profile_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.id = staff_time_off.staff_id) AND (s.profile_id = auth.uid())))));


--
-- Name: staff staff_update_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_update_admin ON public.staff FOR UPDATE USING ((public.current_user_role() = 'admin'::public.user_role));


--
-- Name: staff staff_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_update_own ON public.staff FOR UPDATE USING ((profile_id = auth.uid()));


--
-- Name: profiles users read own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users read own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION check_appointment_conflict(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_appointment_conflict() TO anon;
GRANT ALL ON FUNCTION public.check_appointment_conflict() TO authenticated;
GRANT ALL ON FUNCTION public.check_appointment_conflict() TO service_role;


--
-- Name: FUNCTION create_appointment_multi_service(p_client_id uuid, p_staff_id uuid, p_starts_at timestamp with time zone, p_services jsonb, p_notes text, p_status public.appointment_status, p_payment_method_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_appointment_multi_service(p_client_id uuid, p_staff_id uuid, p_starts_at timestamp with time zone, p_services jsonb, p_notes text, p_status public.appointment_status, p_payment_method_id uuid) TO anon;
GRANT ALL ON FUNCTION public.create_appointment_multi_service(p_client_id uuid, p_staff_id uuid, p_starts_at timestamp with time zone, p_services jsonb, p_notes text, p_status public.appointment_status, p_payment_method_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.create_appointment_multi_service(p_client_id uuid, p_staff_id uuid, p_starts_at timestamp with time zone, p_services jsonb, p_notes text, p_status public.appointment_status, p_payment_method_id uuid) TO service_role;


--
-- Name: FUNCTION current_user_role(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.current_user_role() TO anon;
GRANT ALL ON FUNCTION public.current_user_role() TO authenticated;
GRANT ALL ON FUNCTION public.current_user_role() TO service_role;


--
-- Name: FUNCTION finalize_sale(p_sale_id uuid, p_payments jsonb, p_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.finalize_sale(p_sale_id uuid, p_payments jsonb, p_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.finalize_sale(p_sale_id uuid, p_payments jsonb, p_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.finalize_sale(p_sale_id uuid, p_payments jsonb, p_user_id uuid) TO service_role;


--
-- Name: FUNCTION finalize_sale_v2(p_sale_data jsonb, p_items jsonb, p_payments jsonb, p_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.finalize_sale_v2(p_sale_data jsonb, p_items jsonb, p_payments jsonb, p_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.finalize_sale_v2(p_sale_data jsonb, p_items jsonb, p_payments jsonb, p_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.finalize_sale_v2(p_sale_data jsonb, p_items jsonb, p_payments jsonb, p_user_id uuid) TO service_role;


--
-- Name: FUNCTION finalize_sale_v2(p_sale_data jsonb, p_items jsonb, p_payments jsonb, p_user_id uuid, p_staff_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.finalize_sale_v2(p_sale_data jsonb, p_items jsonb, p_payments jsonb, p_user_id uuid, p_staff_id uuid) TO anon;
GRANT ALL ON FUNCTION public.finalize_sale_v2(p_sale_data jsonb, p_items jsonb, p_payments jsonb, p_user_id uuid, p_staff_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.finalize_sale_v2(p_sale_data jsonb, p_items jsonb, p_payments jsonb, p_user_id uuid, p_staff_id uuid) TO service_role;


--
-- Name: FUNCTION get_appointments_count(p_start_date date, p_end_date date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_appointments_count(p_start_date date, p_end_date date) TO anon;
GRANT ALL ON FUNCTION public.get_appointments_count(p_start_date date, p_end_date date) TO authenticated;
GRANT ALL ON FUNCTION public.get_appointments_count(p_start_date date, p_end_date date) TO service_role;


--
-- Name: FUNCTION get_cash_flow_report(p_start_date date, p_end_date date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_cash_flow_report(p_start_date date, p_end_date date) TO anon;
GRANT ALL ON FUNCTION public.get_cash_flow_report(p_start_date date, p_end_date date) TO authenticated;
GRANT ALL ON FUNCTION public.get_cash_flow_report(p_start_date date, p_end_date date) TO service_role;


--
-- Name: FUNCTION get_cash_flow_report_daily(p_start_date date, p_end_date date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_cash_flow_report_daily(p_start_date date, p_end_date date) TO anon;
GRANT ALL ON FUNCTION public.get_cash_flow_report_daily(p_start_date date, p_end_date date) TO authenticated;
GRANT ALL ON FUNCTION public.get_cash_flow_report_daily(p_start_date date, p_end_date date) TO service_role;


--
-- Name: FUNCTION get_clients_by_birth_month(p_month integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_clients_by_birth_month(p_month integer) TO anon;
GRANT ALL ON FUNCTION public.get_clients_by_birth_month(p_month integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_clients_by_birth_month(p_month integer) TO service_role;


--
-- Name: FUNCTION get_expenses_by_category_report(p_start_date date, p_end_date date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_expenses_by_category_report(p_start_date date, p_end_date date) TO anon;
GRANT ALL ON FUNCTION public.get_expenses_by_category_report(p_start_date date, p_end_date date) TO authenticated;
GRANT ALL ON FUNCTION public.get_expenses_by_category_report(p_start_date date, p_end_date date) TO service_role;


--
-- Name: FUNCTION get_new_vs_returning_report(p_start_date date, p_end_date date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_new_vs_returning_report(p_start_date date, p_end_date date) TO anon;
GRANT ALL ON FUNCTION public.get_new_vs_returning_report(p_start_date date, p_end_date date) TO authenticated;
GRANT ALL ON FUNCTION public.get_new_vs_returning_report(p_start_date date, p_end_date date) TO service_role;


--
-- Name: FUNCTION get_occupancy_rate_report(p_start_date date, p_end_date date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_occupancy_rate_report(p_start_date date, p_end_date date) TO anon;
GRANT ALL ON FUNCTION public.get_occupancy_rate_report(p_start_date date, p_end_date date) TO authenticated;
GRANT ALL ON FUNCTION public.get_occupancy_rate_report(p_start_date date, p_end_date date) TO service_role;


--
-- Name: FUNCTION get_operational_overview(p_start_date date, p_end_date date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_operational_overview(p_start_date date, p_end_date date) TO anon;
GRANT ALL ON FUNCTION public.get_operational_overview(p_start_date date, p_end_date date) TO authenticated;
GRANT ALL ON FUNCTION public.get_operational_overview(p_start_date date, p_end_date date) TO service_role;


--
-- Name: FUNCTION get_revenue_by_service_report(p_start_date date, p_end_date date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_revenue_by_service_report(p_start_date date, p_end_date date) TO anon;
GRANT ALL ON FUNCTION public.get_revenue_by_service_report(p_start_date date, p_end_date date) TO authenticated;
GRANT ALL ON FUNCTION public.get_revenue_by_service_report(p_start_date date, p_end_date date) TO service_role;


--
-- Name: FUNCTION get_staff_performance_report(p_start_date date, p_end_date date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_staff_performance_report(p_start_date date, p_end_date date) TO anon;
GRANT ALL ON FUNCTION public.get_staff_performance_report(p_start_date date, p_end_date date) TO authenticated;
GRANT ALL ON FUNCTION public.get_staff_performance_report(p_start_date date, p_end_date date) TO service_role;


--
-- Name: FUNCTION get_top_products_report(p_start_date date, p_end_date date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_top_products_report(p_start_date date, p_end_date date) TO anon;
GRANT ALL ON FUNCTION public.get_top_products_report(p_start_date date, p_end_date date) TO authenticated;
GRANT ALL ON FUNCTION public.get_top_products_report(p_start_date date, p_end_date date) TO service_role;


--
-- Name: FUNCTION handle_appointment_lifecycle(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_appointment_lifecycle() TO anon;
GRANT ALL ON FUNCTION public.handle_appointment_lifecycle() TO authenticated;
GRANT ALL ON FUNCTION public.handle_appointment_lifecycle() TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION maintain_client_metrics(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.maintain_client_metrics() TO anon;
GRANT ALL ON FUNCTION public.maintain_client_metrics() TO authenticated;
GRANT ALL ON FUNCTION public.maintain_client_metrics() TO service_role;


--
-- Name: FUNCTION normalize_phone_before_write(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.normalize_phone_before_write() TO anon;
GRANT ALL ON FUNCTION public.normalize_phone_before_write() TO authenticated;
GRANT ALL ON FUNCTION public.normalize_phone_before_write() TO service_role;


--
-- Name: FUNCTION normalize_phone_br(p_raw text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.normalize_phone_br(p_raw text) TO anon;
GRANT ALL ON FUNCTION public.normalize_phone_br(p_raw text) TO authenticated;
GRANT ALL ON FUNCTION public.normalize_phone_br(p_raw text) TO service_role;


--
-- Name: FUNCTION recalc_client_aggregates(p_client_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.recalc_client_aggregates(p_client_id uuid) TO anon;
GRANT ALL ON FUNCTION public.recalc_client_aggregates(p_client_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.recalc_client_aggregates(p_client_id uuid) TO service_role;


--
-- Name: FUNCTION rls_auto_enable(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.rls_auto_enable() TO anon;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO authenticated;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO service_role;


--
-- Name: FUNCTION set_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.set_updated_at() TO anon;
GRANT ALL ON FUNCTION public.set_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.set_updated_at() TO service_role;


--
-- Name: FUNCTION settle_commissions(p_transaction_ids uuid[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.settle_commissions(p_transaction_ids uuid[]) TO anon;
GRANT ALL ON FUNCTION public.settle_commissions(p_transaction_ids uuid[]) TO authenticated;
GRANT ALL ON FUNCTION public.settle_commissions(p_transaction_ids uuid[]) TO service_role;


--
-- Name: FUNCTION update_appointment_multi_service(p_appointment_id uuid, p_client_id uuid, p_staff_id uuid, p_starts_at timestamp with time zone, p_services jsonb, p_notes text, p_status public.appointment_status); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_appointment_multi_service(p_appointment_id uuid, p_client_id uuid, p_staff_id uuid, p_starts_at timestamp with time zone, p_services jsonb, p_notes text, p_status public.appointment_status) TO anon;
GRANT ALL ON FUNCTION public.update_appointment_multi_service(p_appointment_id uuid, p_client_id uuid, p_staff_id uuid, p_starts_at timestamp with time zone, p_services jsonb, p_notes text, p_status public.appointment_status) TO authenticated;
GRANT ALL ON FUNCTION public.update_appointment_multi_service(p_appointment_id uuid, p_client_id uuid, p_staff_id uuid, p_starts_at timestamp with time zone, p_services jsonb, p_notes text, p_status public.appointment_status) TO service_role;


--
-- Name: TABLE appointment_services; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.appointment_services TO anon;
GRANT ALL ON TABLE public.appointment_services TO authenticated;
GRANT ALL ON TABLE public.appointment_services TO service_role;


--
-- Name: TABLE appointments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.appointments TO anon;
GRANT ALL ON TABLE public.appointments TO authenticated;
GRANT ALL ON TABLE public.appointments TO service_role;


--
-- Name: TABLE client_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.client_events TO anon;
GRANT ALL ON TABLE public.client_events TO authenticated;
GRANT ALL ON TABLE public.client_events TO service_role;


--
-- Name: TABLE clients; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.clients TO anon;
GRANT ALL ON TABLE public.clients TO authenticated;
GRANT ALL ON TABLE public.clients TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE clients_view; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.clients_view TO anon;
GRANT ALL ON TABLE public.clients_view TO authenticated;
GRANT ALL ON TABLE public.clients_view TO service_role;


--
-- Name: TABLE crm_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.crm_logs TO anon;
GRANT ALL ON TABLE public.crm_logs TO authenticated;
GRANT ALL ON TABLE public.crm_logs TO service_role;


--
-- Name: TABLE finance_transactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.finance_transactions TO anon;
GRANT ALL ON TABLE public.finance_transactions TO authenticated;
GRANT ALL ON TABLE public.finance_transactions TO service_role;


--
-- Name: TABLE leads; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.leads TO anon;
GRANT ALL ON TABLE public.leads TO authenticated;
GRANT ALL ON TABLE public.leads TO service_role;


--
-- Name: TABLE payment_methods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_methods TO anon;
GRANT ALL ON TABLE public.payment_methods TO authenticated;
GRANT ALL ON TABLE public.payment_methods TO service_role;


--
-- Name: TABLE products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;


--
-- Name: TABLE sale_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sale_items TO anon;
GRANT ALL ON TABLE public.sale_items TO authenticated;
GRANT ALL ON TABLE public.sale_items TO service_role;


--
-- Name: TABLE sale_payments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sale_payments TO anon;
GRANT ALL ON TABLE public.sale_payments TO authenticated;
GRANT ALL ON TABLE public.sale_payments TO service_role;


--
-- Name: TABLE sales; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sales TO anon;
GRANT ALL ON TABLE public.sales TO authenticated;
GRANT ALL ON TABLE public.sales TO service_role;


--
-- Name: TABLE services; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.services TO anon;
GRANT ALL ON TABLE public.services TO authenticated;
GRANT ALL ON TABLE public.services TO service_role;


--
-- Name: TABLE staff; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.staff TO anon;
GRANT ALL ON TABLE public.staff TO authenticated;
GRANT ALL ON TABLE public.staff TO service_role;


--
-- Name: TABLE staff_time_off; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.staff_time_off TO anon;
GRANT ALL ON TABLE public.staff_time_off TO authenticated;
GRANT ALL ON TABLE public.staff_time_off TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict LUtLtN2BoNLalEbfV7Vxdxg104Ob6DLb5iTahGjDh2j8wApzz39C2MeECTR79gB

