import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SendSchema = z.object({
  phone: z.string().min(8).max(20),
  message: z.string().min(1).max(2000),
});

export const sendWhatsAppMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SendSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Buscar configurações do WhatsApp
    const { data: settings } = await supabaseAdmin
      .from("whatsapp_settings")
      .select("*")
      .limit(1)
      .single();

    if (!settings || !settings.api_url || !settings.api_key) {
      return { success: false, error: "WhatsApp não configurado. Configure a API em Configurações > WhatsApp." };
    }

    // Registrar mensagem no banco (outbound)
    await supabase.from("whatsapp_messages").insert({
      direction: "out",
      phone: data.phone,
      content: data.message,
      status: "sent",
    });

    // Tentar enviar via API externa (Evolution API ou similar)
    try {
      const url = settings.api_url.replace(/\/$/, "") + "/message/sendText";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": settings.api_key,
        },
        body: JSON.stringify({
          number: data.phone,
          text: data.message,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "unknown");
        return { success: false, error: `Erro ao enviar: ${res.status} ${errText}` };
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: `Falha na conexão: ${(e as Error).message}` };
    }
  });

const SettingsSchema = z.object({
  api_url: z.string().url().optional(),
  api_key: z.string().optional(),
  default_message: z.string().optional(),
  auto_reply_enabled: z.boolean().optional(),
});

export const saveWhatsAppSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SettingsSchema.parse(d))
  .handler(async ({ data }) => {
    const { data: existing } = await supabaseAdmin
      .from("whatsapp_settings")
      .select("id")
      .limit(1)
      .single();

    if (existing) {
      const { error } = await supabaseAdmin
        .from("whatsapp_settings")
        .update(data)
        .eq("id", existing.id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabaseAdmin.from("whatsapp_settings").insert(data);
      if (error) return { success: false, error: error.message };
    }

    return { success: true };
  });

export const getWhatsAppSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data } = await supabaseAdmin
      .from("whatsapp_settings")
      .select("*")
      .limit(1)
      .single();
    return { settings: data };
  });

export const getWhatsAppMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("whatsapp_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return { messages: [] };
    return { messages: data ?? [] };
  });
