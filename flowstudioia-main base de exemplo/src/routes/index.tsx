import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkles, Calendar, MessageCircle, Instagram, MapPin, Phone, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-salon.jpg";
import hairImg from "@/assets/service-hair.jpg";
import nailsImg from "@/assets/service-nails.jpg";
import browsImg from "@/assets/service-brows.jpg";
import { supabase } from "@/integrations/supabase/client";
import { submitLead } from "@/lib/leads.functions";
import { AIChatWidget } from "@/components/ai-chat-widget";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "FlowStudio AI — Gestão de salão premium com agenda inteligente" },
      { name: "description", content: "Cabelo, unhas, sobrancelhas e mais. Agende online em segundos com a FlowStudio AI." },
    ],
  }),
});

type Service = { id: string; name: string; description: string | null; price: number; duration_minutes: number; category: string | null };
type Staff = { id: string; full_name: string; role_title: string | null; bio: string | null };

const fallbackImages: Record<string, string> = {
  Cabelo: hairImg,
  Unhas: nailsImg,
  Sobrancelhas: browsImg,
};

function Landing() {
  const [services, setServices] = useState<Service[]>([]);
  const [team, setTeam] = useState<Staff[]>([]);

  useEffect(() => {
    supabase.from("services").select("*").eq("active", true).then(({ data }) => setServices((data as Service[]) ?? []));
    supabase.from("staff").select("*").eq("active", true).then(({ data }) => setTeam((data as Staff[]) ?? []));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Services items={services} />
      <Team items={team} />
      <Testimonials />
      <Contact />
      <Footer />
      <AIChatWidget />
    </div>
  );
}

function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
          <Sparkles className="h-5 w-5 text-primary" /> FlowStudio AI
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#servicos" className="hover:text-foreground transition">Serviços</a>
          <a href="#equipe" className="hover:text-foreground transition">Equipe</a>
          <a href="#contato" className="hover:text-foreground transition">Contato</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Entrar</Link>
          <a href="#contato" className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition">Agendar</a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative pt-28 pb-20 overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-6 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3 w-3" /> Beleza, cuidado e ritual
          </span>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05]">
            Sua próxima<br />sessão de beleza,<br /><span className="italic text-primary">sem espera.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Agenda inteligente, atendimento por WhatsApp e uma equipe que entende você. Marque online em segundos.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#contato" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition">
              <Calendar className="h-4 w-4" /> Agendar agora
            </a>
            <a href="#servicos" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-medium hover:bg-secondary transition">
              Ver serviços <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="md:col-span-6">
          <div className="relative">
            <img src={heroImg} alt="Interior do salão FlowStudio AI" width={1600} height={1200}
              className="rounded-3xl shadow-[var(--shadow-elegant)] aspect-[4/3] object-cover" />
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl px-5 py-4 shadow-[var(--shadow-soft)] hidden md:block">
              <div className="text-3xl font-display font-semibold">+1.200</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">clientes felizes</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services({ items }: { items: Service[] }) {
  return (
    <section id="servicos" className="py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary mb-3">Serviços</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold max-w-xl">Cuidado completo, do início ao brilho final.</h2>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((s) => (
            <article key={s.id} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-[var(--shadow-elegant)] transition">
              <div className="aspect-[4/3] overflow-hidden bg-secondary">
                <img src={fallbackImages[s.category ?? ""] ?? hairImg} alt={s.name} loading="lazy" width={800} height={600}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              </div>
              <div className="p-6">
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-display text-xl font-semibold">{s.name}</h3>
                  <span className="text-primary font-medium">R$ {Number(s.price).toFixed(0)}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                <p className="text-xs text-muted-foreground mt-3">{s.duration_minutes} min</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Team({ items }: { items: Staff[] }) {
  return (
    <section id="equipe" className="py-24 px-6 bg-secondary/40">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-widest text-primary mb-3">Equipe</p>
        <h2 className="font-display text-4xl md:text-5xl font-semibold max-w-xl mb-12">Mãos talentosas, olhar cuidadoso.</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((p) => (
            <div key={p.id} className="rounded-2xl bg-card border border-border p-8">
              <div className="h-16 w-16 rounded-full bg-accent/40 flex items-center justify-center mb-4 font-display text-2xl text-primary">
                {p.full_name.charAt(0)}
              </div>
              <h3 className="font-display text-xl font-semibold">{p.full_name}</h3>
              <p className="text-sm text-primary mb-3">{p.role_title}</p>
              <p className="text-sm text-muted-foreground">{p.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: "Marina S.", text: "O atendimento por WhatsApp é incrível. Agendei em 30 segundos." },
    { name: "Camila R.", text: "A Ana me deixou com o melhor cabelo da minha vida. Voltei na semana seguinte." },
    { name: "Júlia P.", text: "Ambiente lindo, equipe atenciosa e a IA me ajudou a escolher o serviço." },
  ];
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-widest text-primary mb-3">Depoimentos</p>
        <h2 className="font-display text-4xl md:text-5xl font-semibold mb-12">O que dizem nossas clientes.</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <blockquote key={i} className="rounded-2xl border border-border bg-card p-8">
              <p className="font-display text-lg leading-relaxed mb-4">“{t.text}”</p>
              <footer className="text-sm text-muted-foreground">— {t.name}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const submit = useServerFn(submitLead);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await submit({ data: {
        name: String(fd.get("name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        email: String(fd.get("email") ?? ""),
        message: String(fd.get("message") ?? ""),
      }});
      toast.success("Recebemos sua mensagem! Em breve entraremos em contato.");
      e.currentTarget.reset();
    } catch {
      toast.error("Não foi possível enviar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="contato" className="py-24 px-6 bg-secondary/40">
      <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary mb-3">Contato</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6">Vamos agendar seu momento?</h2>
          <p className="text-muted-foreground mb-8 max-w-md">Deixe seus dados que nossa equipe entra em contato pelo WhatsApp em minutos.</p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> (11) 99999-0000</li>
            <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> Rua das Flores, 123 — São Paulo</li>
            <li className="flex items-center gap-3"><Instagram className="h-4 w-4 text-primary" /> @flowstudioai</li>
            <li className="flex items-center gap-3"><MessageCircle className="h-4 w-4 text-primary" /> Atendimento via WhatsApp</li>
          </ul>
        </div>
        <form onSubmit={onSubmit} className="rounded-3xl bg-card border border-border p-8 space-y-4 shadow-[var(--shadow-soft)]">
          <input name="name" required maxLength={100} placeholder="Seu nome" className="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
          <input name="phone" maxLength={40} placeholder="WhatsApp" className="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
          <input name="email" type="email" maxLength={200} placeholder="E-mail (opcional)" className="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
          <textarea name="message" maxLength={1000} rows={4} placeholder="Qual serviço você gostaria?" className="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
          <button disabled={busy} className="w-full rounded-full bg-primary text-primary-foreground py-3 font-medium hover:opacity-90 transition disabled:opacity-50">
            {busy ? "Enviando..." : "Quero agendar"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="font-display text-lg text-foreground">FlowStudio AI</div>
        <div>© {new Date().getFullYear()} FlowStudio AI. Todos os direitos reservados.</div>
        <Link to="/login" className="hover:text-foreground">Acesso administrativo</Link>
      </div>
    </footer>
  );
}
