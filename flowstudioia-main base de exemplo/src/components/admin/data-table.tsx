import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export type Field = { name: string; label: string; type?: "text" | "number" | "date" | "textarea"; required?: boolean };

type Row = Record<string, unknown> & { id: string };

export function CrudPage({
  title, table, fields, columns,
}: {
  title: string;
  table: string;
  fields: Field[];
  columns: { key: string; label: string; format?: (v: unknown) => string }[];
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const sb = (supabase as any).from(table);

  async function load() {
    const { data, error } = await sb.select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setRows((data as Row[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const v = form[f.name];
      if (!v && !f.required) continue;
      payload[f.name] = f.type === "number" ? Number(v) : v;
    }
    const { error } = await sb.insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Salvo!");
    setOpen(false); setForm({}); load();
  }
  async function remove(id: string) {
    if (!confirm("Excluir?")) return;
    const { error } = await sb.delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); load(); }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium">
          <Plus className="h-4 w-4" /> Novo
        </button>
      </header>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left"><tr>{columns.map(c => <th key={c.key} className="px-4 py-3 font-medium">{c.label}</th>)}<th /></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-border">
                {columns.map(c => <td key={c.key} className="px-4 py-3">{c.format ? c.format(r[c.key]) : String(r[c.key] ?? "")}</td>)}
                <td className="px-4 py-3 text-right"><button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-muted-foreground">Nenhum registro.</td></tr>}
          </tbody>
        </table>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-foreground/30 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl border border-border p-6 w-full max-w-md space-y-4">
            <h2 className="font-display text-xl font-semibold">Novo registro</h2>
            {fields.map(f => (
              <div key={f.name}>
                <label className="text-xs text-muted-foreground">{f.label}</label>
                {f.type === "textarea"
                  ? <textarea rows={3} value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 mt-1" />
                  : <input type={f.type ?? "text"} value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 mt-1" />}
              </div>
            ))}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm">Cancelar</button>
              <button onClick={save} className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
