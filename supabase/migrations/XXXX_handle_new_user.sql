-- supabase/migrations/XXXX_handle_new_user.sql
-- 0.4 — Cria profile + garante ficha em clients no signup.
-- Dois caminhos: conversão (metadata.client_id) e signup A1 (sem client_id).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_client_id   uuid; v_full_name   text; v_email       text; v_phone       text; v_meta_client uuid; v_matched     uuid; begin v_email     := coalesce(new.email, ''); v_full_name := nullif(new.raw_user_meta_data ->> 'full_name', ''); v_phone     := nullif(new.raw_user_meta_data ->> 'phone', ''); -- 1. Profile sempre nasce (idempotente). insert into public.profiles (id, email, full_name, role) values (new.id, v_email, v_full_name, 'client') on conflict (id) do nothing; -- 2. Caminho CONVERSÃO (X2.2): metadata traz client_id. v_meta_client := nullif(new.raw_user_meta_data ->> 'client_id', '')::uuid; if v_meta_client is not null then -- liga apenas se a ficha existe e ainda não tem dono. update public.clients set profile_id = new.id, updated_at = now() where id = v_meta_client and profile_id is null; return new; end if; -- 3. Caminho SIGNUP A1: tenta ligar a walk-in existente. --    Prioridade: email, depois phone. Só walk-in (profile_id null). select id into v_matched from public.clients where profile_id is null and ( (v_email <> '' and lower(email) = lower(v_email)) or (v_phone is not null and phone = v_phone) ) order by (lower(email) = lower(v_email)) desc  -- email match primeiro limit 1; if v_matched is not null then update public.clients set profile_id = new.id, full_name  = coalesce(full_name, v_full_name), email      = coalesce(email, nullif(v_email, '')), phone      = coalesce(phone, v_phone), updated_at = now() where id = v_matched; else -- nenhuma ficha: cria nova. insert into public.clients (profile_id, full_name, email, phone) values (new.id, v_full_name, nullif(v_email, ''), v_phone); end if; return new; end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
