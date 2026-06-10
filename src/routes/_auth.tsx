import { createFileRoute, Outlet } from '@tanstack/react-router'
import { systemThemeClass } from '@/lib/core/system'

/**
 * _auth — Layout pathless do grupo de autenticacao.
 * ----------------------------------------------------------------
 * Fonte unica do tema de SISTEMA (systemThemeClass) para as telas
 * publicas de auth: /login, /forgot-password, /reset-password.
 *
 * Sem guard: cada rota filha mantem seu proprio beforeLoad
 * (ex: login redireciona admin logado).
 *
 * URLs inalteradas — pathless nao adiciona segmento.
 * ----------------------------------------------------------------
 */
export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className={systemThemeClass}>
      <Outlet />
    </div>
  )
}
