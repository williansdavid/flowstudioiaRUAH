import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/services')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_public/services"!</div>
}
