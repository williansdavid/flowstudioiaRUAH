import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/use-auth";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { saveWhatsAppSettings, getWhatsAppSettings } from "@/lib/whatsapp.functions";

export const Route = createFileRoute("/admin/settings")({ component: Settings });

function Settings() {
  const { user, roles } = useAuth();
  const fetchSettings = useServerFn(getWhatsAppSettings);
  const saveSettings = useServerFn(saveWhatsAppSettings);

  const [wa, setWa] = useState({ api_url: "", api_key: "", default_message: "", auto_reply_enabled: false });
  const [loading, setLoading] = useState(false);

  async function loadWa() {
    const { settings } = await fetchSettings({ data: undefined });
    if (settings) setWa({
      api_url: settings.api_url || "",
      api_key: settings.api_key || "",
      default_message: settings.default_message || "",
      auto_reply_enabled: settings.auto_reply_enabled || false,
    });
  }

  async function saveWa() {
    setLoading(true);
    const { success, error } = await saveSettings({ data: wa });
    setLoading(false);
    if (!success) { toast.error(error || "Erro ao salvar"); return; }
    toast.success("Configurações salvas!");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-3xl font-semibold">Configurações</h1>
      <div className="rounded-2xl border border-border bg-card p-6 space-y-2">
        <h2 className="font-display text-lg font-semibold">Conta</h2>
        <p className="text-sm text-muted-foreground">E-mail: {user?.email}</p>
        <p className="text-sm text-muted-foreground">Papéis: {roles.join(", ") || "—"}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold">WhatsApp (Evolution API)</h2>
        <p className="text-sm text-muted-foreground">Configure sua instância da Evolution API para envio e recebimento de mensagens.</p>
        <input value={wa.api_url} onChange={(e) => setWa({ ...wa, api_url: e.target.value })} placeholder="URL da API (ex: https://evo.seudominio.com)" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        <input value={wa.api_key} onChange={(e) => setWa({ ...wa, api_key: e.target.value })} placeholder="API Key" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        <textarea value={wa.default_message} onChange={(e) => setWa({ ...wa, default_message: e.target.value })} rows={3} placeholder="Mensagem automática de boas-vindas" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={wa.auto_reply_enabled} onChange={(e) => setWa({ ...wa, auto_reply_enabled: e.target.checked })} className="rounded" />
          Ativar resposta automática
        </label>
        <button onClick={saveWa} disabled={loading} className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm disabled:opacity-50">{loading ? "Salvando..." : "Salvar configurações"}</button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-2">
        <h2 className="font-display text-lg font-semibold">Webhook</h2>
        <p className="text-sm text-muted-foreground">Use este endpoint no painel da Evolution API:</p>
        <code className="block bg-secondary rounded-lg px-3 py-2 text-xs break-all">{typeof window !== "undefined" ? window.location.origin : ""}/api/public/whatsapp-webhook</code>
      </div>
    </div>
  );
}
