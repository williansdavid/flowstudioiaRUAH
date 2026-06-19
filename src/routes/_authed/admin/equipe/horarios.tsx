import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/admin/equipe/horarios')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/admin/equipe/horarios"!</div>
}
