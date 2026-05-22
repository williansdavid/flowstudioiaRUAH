import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/data-table";

export const Route = createFileRoute("/admin/staff")({ component: () => (
  <CrudPage
    title="Colaboradores"
    table="staff"
    fields={[
      { name: "full_name", label: "Nome", required: true },
      { name: "role_title", label: "Cargo" },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "commission_rate", label: "Comissão (%)", type: "number" },
    ]}
    columns={[
      { key: "full_name", label: "Nome" },
      { key: "role_title", label: "Cargo" },
      { key: "commission_rate", label: "Comissão" },
    ]}
  />
)});