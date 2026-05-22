-- ============================================
-- user_roles: garantir índice único + RLS + policy
-- (idempotente — pode rodar várias vezes sem quebrar)
-- ============================================

-- 1) Índice único (user_id, role) — evita duplicar role pro mesmo user
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_id_role_key
  ON public.user_roles(user_id, role);

-- 2) Habilita RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3) Policy: usuário lê apenas as próprias roles
DROP POLICY IF EXISTS "users_read_own_roles" ON public.user_roles;
CREATE POLICY "users_read_own_roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- 4) (Opcional, recomendado) Policy de admin gerenciar roles
-- Só admins podem inserir/atualizar/deletar roles
DROP POLICY IF EXISTS "admins_manage_roles" ON public.user_roles;
CREATE POLICY "admins_manage_roles"
  ON public.user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );
