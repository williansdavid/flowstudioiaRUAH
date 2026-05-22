import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";

type Appt = { id: string; start_at: string; end_at: string; status: string; price: number | null;
  clients?: { full_name: string } | null; staff?: { full_name: string } | null; services?: { name: string } | null };

export const Route = createFileRoute("/admin/agenda")({ component: Agenda });

function Agenda() {
  const [items, setItems] = useState<Appt[]>([]);
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<{ clients: any[]; staff: any[]; services: any[] }>({ clients: [], staff: [], services: [] });
  const [form, setForm] = useState({ client_id: "", staff_id: "", service_id: "", start_at: "" });

  async function load() {
    const { data } = await supabase.from("appointments")
      .select("*, clients(full_name), staff(full_name), services(name)")
      .order("start_at", { ascending: true });
    setItems((data as Appt[]) ?? []);
  }
  useEffect(() => {
    load();
    Promise.all([
      supabase.from("clients").select("id, full_name"),
      supabase.from("staff").select("id, full_name").eq("active", true),
      supabase.from("services").select("id, name, duration_minutes, price").eq("active", true),
    ]).then(([c, s, sv]) => setOpts({ clients: c.data ?? [], staff: s.data ?? [], services: sv.data ?? [] }));
  }, []);

  async function create() {
    const svc = opts.services.find(s => s.id === form.service_id);
    if (!svc || !form.start_at) return toast.error("Preencha todos os campos");
    const start = new Date(form.start_at);
    const end = new Date(start.getTime() + svc.duration_minutes * 60000);
    const { error } = await supabase.from("appointments").insert({
      client_id: form.client_id || null,
      staff_id: form.staff_id || null,
      service_id: form.service_id,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      price: svc.price,
      status: "confirmed",
    });
    if (error) return toast.error(error.message);
    toast.success("Agendado!");
    setOpen(false); setForm({ client_id: "", staff_id: "", service_id: "", start_at: "" }); load();
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div><h1 className="font-display text-3xl font-semibold">Agenda</h1><p className="text-muted-foreground">Próximos atendimentos.</p></div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm"><Plus className="h-4 w-4" /> Novo agendamento</button>
      </header>
      <div className="space-y-2">
        {items.map(a => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{a.services?.name ?? "Serviço"} — {a.clients?.full_name ?? "Cliente"}</div>
              <div className="text-sm text-muted-foreground">com {a.staff?.full_name ?? "—"} • {new Date(a.start_at).toLocaleString("pt-BR")}</div>
            </div>
            <span className="text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-secondary">{a.status}</span>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-center py-12">Nenhum agendamento ainda.</p>}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-foreground/30 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl border border-border p-6 w-full max-w-md space-y-3">
            <h2 className="font-display text-xl font-semibold">Novo agendamento</h2>
            <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2"><option value="">Cliente</option>{opts.clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}</select>
            <select value={form.staff_id} onChange={(e) => setForm({ ...form, staff_id: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2"><option value="">Profissional</option>{opts.staff.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}</select>
            <select value={form.service_id} onChange={(e) => setForm({ ...form, service_id: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2"><option value="">Serviço</option>{opts.services.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <input type="datetime-local" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2" />
            <div className="flex justify-end gap-2"><button onClick={() => setOpen(false)} className="px-4 py-2 text-sm">Cancelar</button><button onClick={create} className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm">Agendar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}