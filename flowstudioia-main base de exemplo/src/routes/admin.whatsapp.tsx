import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Tipagem da mensagem (ajuste conforme seu schema)
type Message = {
  id: string;
  content: string;
  created_at: string;
};

async function fetchMessages(): Promise<{ messages: Message[] }> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return { messages: data ?? [] };
}

function WhatsappAdminPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const { messages } = await fetchMessages();
      setMessages(messages ?? []);
    } catch (err: any) {
      setError(err.message ?? "Erro ao carregar mensagens.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Carregando mensagens...</p>;
  if (error) return <p className="text-red-500">Erro: {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">WhatsApp - Mensagens</h1>
      {messages.length === 0 ? (
        <p>Nenhuma mensagem encontrada.</p>
      ) : (
        <ul className="space-y-2">
          {messages.map((msg) => (
            <li key={msg.id} className="border rounded p-2">
              <p>{msg.content}</p>
              <span className="text-xs text-gray-400">{msg.created_at}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const Route = createFileRoute("/admin/whatsapp")({
  component: WhatsappAdminPage,
});
