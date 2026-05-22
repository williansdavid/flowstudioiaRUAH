import { createFileRoute } from "@tanstack/react-router";
import { createHmac } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/whatsapp-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        const signature = request.headers.get("x-webhook-signature");

        // Tentar verificar assinatura se houver secret configurado
        const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
        if (webhookSecret && signature) {
          const expected = createHmac("sha256", webhookSecret).update(body).digest("hex");
          if (expected !== signature) {
            return new Response("Invalid signature", { status: 401 });
          }
        }

        let payload: any;
        try {
          payload = JSON.parse(body);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        // Suporta formato Evolution API e WhatsApp Business API
        const phone = payload.data?.sender?.replace(/[^0-9]/g, "") || payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
        const content = payload.data?.message?.conversation || payload.data?.message?.text || payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;

        if (!phone || !content) {
          return new Response("Missing phone or content", { status: 400 });
        }

        // Buscar cliente pelo telefone
        const { data: client } = await supabaseAdmin
          .from("clients")
          .select("id")
          .eq("whatsapp_phone", phone)
          .limit(1)
          .single();

        // Inserir mensagem recebida
        await supabaseAdmin.from("whatsapp_messages").insert({
          direction: "in",
          phone,
          content,
          status: "received",
          client_id: client?.id ?? null,
        });

        // Verificar auto-reply
        const { data: settings } = await supabaseAdmin
          .from("whatsapp_settings")
          .select("auto_reply_enabled, default_message")
          .limit(1)
          .single();

        if (settings?.auto_reply_enabled && settings.default_message) {
          // Aqui poderia chamar a API para enviar auto-resposta
          // Por enquanto apenas logamos
          await supabaseAdmin.from("whatsapp_messages").insert({
            direction: "out",
            phone,
            content: settings.default_message,
            status: "sent",
            client_id: client?.id ?? null,
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
