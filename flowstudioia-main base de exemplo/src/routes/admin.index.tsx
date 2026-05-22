import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, Wallet, TrendingUp, MessageCircle } from "lucide-react";
import { getWhatsAppMessages } from "@/lib/whatsapp.functions";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const [stats, setStats] = useState({ today: 0, week: 0, clients: 0, revenue: 0, staff: 0, pending: 0, whatsapp: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const fetchMessages = useServerFn(getWhatsAppMessages);

  useEffect(() => {
    (async () => {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

      const [a, aw, c, r, s, p, wm] = await Promise.all([
        supabase.from("appointments").select("id", { count: "exact", head: true }).gte("start_at", start.toISOString()).lte("start_at", end.toISOString()),
        supabase.from("appointments").select("id", { count: "exact", head: true }).gte("start_at", weekStart.toISOString()),
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("finance_transactions").select("amount").eq("type", "income").gte("occurred_at", monthStart.toISOString().slice(0, 10)),
        supabase.from("staff").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "pending"),
        fetchMessages({ data: undefined }),
      ]);

      const revenue = (r.data ?? []).reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0);
      setStats({
        today: a.count ?? 0,
        week: aw.count ?? 0,
        clients: c.count ?? 0,
        revenue,
        staff: s.count ?? 0,
        pending: p.count ?? 0,
        whatsapp: wm.messages?.length ?? 0,
      });

      const { data: recentAppts } = await supabase.from("appointments")
        .select("*, clients(full_name), staff(full_name), services(name)")
        .order("start_at", { ascending: true })
        .gte("start_at", start.toISOString())
        .limit(5);
      setRecent(recentAppts ?? []);
    })();
  }, []);

  const cards = [
    { label: "Agendamentos hoje", value: stats.today, icon: Calendar, color: "bg-blue-50" },
    { label: "Agendamentos semana", value: stats.week, icon: TrendingUp, color: "bg-green-50" },
    { label: "Clientes cadastrados", value: stats.clients, icon: Users, color: "bg-purple-50" },
    { label: "Receita do mês", value: `R$ ${stats.revenue.toFixed(2)}`, icon: Wallet, color: "bg-amber-50" },
    { label: "Pendentes", value: stats.pending, icon: Calendar, color: "bg-orange-50" },
    { label: "Conversas WhatsApp", value: stats.whatsapp, icon: MessageCircle, color: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da FlowStudio AI.</p>
      </header>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-2xl border border-border p-6 ${c.color}`}>
            <c.icon className="h-5 w-5 text-primary mb-3" />
            <div className="text-3xl font-display font-semibold">{c.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Próximos atendimentos hoje</h2>
          {recent.length === 0 && <p className="text-muted-foreground text-sm">Nenhum agendamento hoje.</p>}
          <div className="space-y-3">
            {recent.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <div className="font-medium text-sm">{a.services?.name ?? "Serviço"} — {a.clients?.full_name ?? "Cliente"}</div>
                  <div className="text-xs text-muted-foreground">{a.staff?.full_name ?? "—"} • {new Date(a.start_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <span className={`text-xs uppercase px-2 py-1 rounded-full ${a.status === "confirmed" ? "bg-green-100 text-green-700" : a.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-secondary text-muted-foreground"}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold mb-2">Próximos passos</h2>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
            <li>Cadastre seu time em <strong>Colaboradores</strong>.</li>
            <li>Ajuste os <strong>Serviços</strong> oferecidos.</li>
            <li>Use a <strong>Agenda</strong> para registrar atendimentos.</li>
            <li>Configure o <strong>WhatsApp</strong> para automação.</li>
            <li>Ative a <strong>IA</strong> na landing para capturar leads.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
