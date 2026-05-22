-- migration: add_role_to_user_roles.sql
ALTER TABLE public.user_roles
  ADD COLUMN role public.user_role NOT NULL DEFAULT 'client';

-- Constraint para não duplicar role por usuário
CREATE UNIQUE INDEX user_roles_user_id_role_key 
  ON public.user_roles(user_id, role);

-- RLS: usuário só vê suas próprias roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_roles" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id);
