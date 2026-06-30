import { createFileRoute } from '@tanstack/react-router'
import { ClientsPageContent } from '@/features/clients/components/ClientsPageContent'

export const Route = createFileRoute('/_authed/admin/clientes')({
  staticData: { title: 'Clientes' },
  component: ClientesPage,
})

function ClientesPage() {
  return (
    <div className="h-full w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[1600px] flex-1 flex flex-col p-0 sm:p-6 lg:px-8 overflow-hidden sm:gap-6 min-h-0">
        <div className="flex-1 overflow-y-auto px-4 sm:px-0">
          <ClientsPageContent />
        </div>
      </div>
    </div>
  )
}