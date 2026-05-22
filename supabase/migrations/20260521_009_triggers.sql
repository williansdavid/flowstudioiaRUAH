-- =====================================================
-- TRIGGER: ao criar usuário no auth.users
-- cria automaticamente profile + client/staff conforme role
-- =====================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_role public.user_role; begin v_role := coalesce( (new.raw_user_meta_data->>'role')::public.user_role, 'client' ); insert into public.profiles (id, email, full_name, phone, role) values ( new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), new.raw_user_meta_data->>'phone', v_role ); if v_role = 'client' then insert into public.clients (profile_id) values (new.id); end if; if v_role = 'staff' then insert into public.staff (profile_id) values (new.id); end if; return new; end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();