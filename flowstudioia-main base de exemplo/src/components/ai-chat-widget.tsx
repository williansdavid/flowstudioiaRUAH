import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { chatWithAssistant } from "@/lib/ai.functions";
import { MessageCircle, Send, X, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Olá! Sou a assistente virtual da FlowStudio AI. Como posso ajudar com seu agendamento?" },
  ]);
  const chat = useServerFn(chatWithAssistant);

  async function send() {
    const t = input.trim();
    if (!t || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: t }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const { reply } = await chat({ data: { messages: next } });
      setMsgs([...next, { role: "assistant", content: reply }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "Tive um problema. Tente novamente." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-[var(--shadow-elegant)] hover:opacity-90 transition"
        >
          <Sparkles className="h-4 w-4" /> Fale com a IA
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-secondary">
            <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary" /><span className="font-display font-semibold">Assistente FlowStudio AI</span></div>
            <button onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 max-h-[420px] overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`text-sm leading-relaxed ${m.role === "user" ? "text-right" : ""}`}>
                <span className={`inline-block px-3 py-2 rounded-2xl ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>{m.content}</span>
              </div>
            ))}
            {busy && <div className="text-xs text-muted-foreground">Digitando…</div>}
          </div>
          <div className="flex gap-2 p-3 border-t border-border">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Quero agendar manicure…"
              className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button onClick={send} disabled={busy} className="rounded-full bg-primary text-primary-foreground p-2 disabled:opacity-50"><Send className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </>
  );
}