import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/data-table";

export const Route = createFileRoute("/admin/services")({ component: () => (
  <CrudPage
    title="Serviços"
    table="services"
    fields={[
      { name: "name", label: "Nome", required: true },
      { name: "category", label: "Categoria" },
      { name: "description", label: "Descrição", type: "textarea" },
      { name: "duration_minutes", label: "Duração (min)", type: "number", required: true },
      { name: "price", label: "Preço", type: "number", required: true },
    ]}
    columns={[
      { key: "name", label: "Nome" },
      { key: "category", label: "Categoria" },
      { key: "duration_minutes", label: "Duração" },
      { key: "price", label: "Preço", format: (v) => `R$ ${Number(v).toFixed(2)}` },
    ]}
  />
)});