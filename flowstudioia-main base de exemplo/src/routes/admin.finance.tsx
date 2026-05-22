import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/data-table";

export const Route = createFileRoute("/admin/finance")({ component: () => (
  <CrudPage
    title="Financeiro"
    table="finance_transactions"
    fields={[
      { name: "type", label: "Tipo (income/expense)", required: true },
      { name: "amount", label: "Valor", type: "number", required: true },
      { name: "category", label: "Categoria" },
      { name: "description", label: "Descrição" },
      { name: "occurred_at", label: "Data", type: "date" },
    ]}
    columns={[
      { key: "occurred_at", label: "Data" },
      { key: "type", label: "Tipo" },
      { key: "amount", label: "Valor", format: (v) => `R$ ${Number(v).toFixed(2)}` },
      { key: "category", label: "Categoria" },
    ]}
  />
)});