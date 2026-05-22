import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/admin", data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block bg-secondary" style={{ background: "var(--gradient-warm)" }}>
        <div className="h-full flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold"><Sparkles className="h-5 w-5 text-primary" /> FlowStudio AI</Link>
          <div>
            <h2 className="font-display text-4xl font-semibold leading-tight max-w-sm">Bem-vinda ao painel da FlowStudio AI.</h2>
            <p className="text-muted-foreground mt-3 max-w-sm">Sua agenda, sua equipe e sua receita em um só lugar.</p>
          </div>
          <div />
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <h1 className="font-display text-3xl font-semibold">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
          <p className="text-sm text-muted-foreground">Acesso administrativo da FlowStudio AI.</p>
          {mode === "signup" && (
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nome completo" className="w-full rounded-lg border border-input bg-background px-4 py-3" />
          )}
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="E-mail" className="w-full rounded-lg border border-input bg-background px-4 py-3" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} type="password" placeholder="Senha" className="w-full rounded-lg border border-input bg-background px-4 py-3" />
          <button disabled={busy} className="w-full rounded-full bg-primary text-primary-foreground py-3 font-medium disabled:opacity-50">
            {busy ? "Aguarde..." : (mode === "login" ? "Entrar" : "Criar conta")}
          </button>
          <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-sm text-muted-foreground hover:text-foreground w-full">
            {mode === "login" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
          </button>
          <p className="text-xs text-muted-foreground text-center">A primeira conta criada precisa receber o papel <strong>admin</strong> manualmente no banco de dados.</p>
        </form>
      </div>
    </div>
  );
}