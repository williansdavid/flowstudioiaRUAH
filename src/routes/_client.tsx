import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSession } from '@/server/auth/getSession'
import { systemThemeClass } from '@/lib/core/system'

export const Route = createFileRoute('/_client')({
  beforeLoad: async () => {
    const session = await getSession()

    if (!session) {
      throw redirect({ to: '/login' })
    }

    if (session.profile.role !== 'client') {
      throw redirect({ to: '/admin' })
    }

    return { session }
  },
  component: ClientGuardLayout,
})

function ClientGuardLayout() {
  return (
    <div className={systemThemeClass}>
      <Outlet />
    </div>
  )
}