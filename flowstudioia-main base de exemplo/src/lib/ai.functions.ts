import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Schema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().min(1).max(2000),
  })).min(1).max(30),
});

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Schema.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { reply: "Assistente indisponível: configure o LOVABLE_API_KEY." };
    }

    const system = {
      role: "system" as const,
      content:
        "Você é a recepcionista virtual do FlowStudio AI. Seja calorosa, breve e elegante. " +
        "Ajude com: serviços (corte, coloração, manicure, pedicure, sobrancelhas, hidratação), " +
        "preços médios (R$50–R$250), horários (10h–19h, ter a sáb) e agendamentos. " +
        "Quando o cliente quiser agendar, peça nome, telefone, serviço e melhor horário, " +
        "e diga que a equipe confirmará via WhatsApp em instantes. Responda sempre em português.",
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [system, ...data.messages],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) return { reply: "Muitas mensagens. Tente em alguns instantes." };
      if (res.status === 402) return { reply: "Limite de uso da IA atingido. Avise o administrador." };
      return { reply: "Não consegui responder agora. Tente novamente." };
    }
    const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    return { reply: json.choices?.[0]?.message?.content ?? "..." };
  });