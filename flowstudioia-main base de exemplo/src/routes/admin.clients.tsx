import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/data-table";

export const Route = createFileRoute("/admin/clients")({ component: () => (
  <CrudPage
    title="Clientes"
    table="clients"
    fields={[
      { name: "full_name", label: "Nome", required: true },
      { name: "phone", label: "Telefone" },
      { name: "email", label: "E-mail" },
      { name: "birthday", label: "Aniversário", type: "date" },
      { name: "notes", label: "Observações", type: "textarea" },
    ]}
    columns={[
      { key: "full_name", label: "Nome" },
      { key: "phone", label: "Telefone" },
      { key: "email", label: "E-mail" },
    ]}
  />
)});