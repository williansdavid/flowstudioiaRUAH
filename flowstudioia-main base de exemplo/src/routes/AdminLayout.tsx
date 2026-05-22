// app/routes/admin/AdminLayout.tsx
import { Link, Outlet, useLocation } from "react-router";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCheck,
  Scissors,
  DollarSign,
  Settings,
  MessageCircle,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Agenda",
    to: "/admin/agenda",
    icon: CalendarDays,
  },
  {
    label: "Clientes",
    to: "/admin/clientes",
    icon: Users,
  },
  {
    label: "Staff",
    to: "/admin/staff",
    icon: UserCheck,
  },
  {
    label: "Serviços",
    to: "/admin/servicos",
    icon: Scissors,
  },
  {
    label: "Financeiro",
    to: "/admin/finance",
    icon: DollarSign,
  },
  {
    label: "WhatsApp",
    to: "/admin/whatsapp",
    icon: MessageCircle,
  },
  {
    label: "Config.",
    to: "/admin/configuracoes",
    icon: Settings,
  },
];

// Itens que aparecem no bottom nav mobile (limitado a 5)
const bottomNavItems = navItems.slice(0, 5);

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (to: string, end?: boolean) => {
    if (end) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex">

      {/* ── OVERLAY MOBILE ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ──────────────────────────────────────────
          SIDEBAR — oculta em mobile, fixa em desktop
      ────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-40 flex flex-col
          bg-[#FAF7F4] border-r border-[#E8DDD4]
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:flex
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8DDD4]">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#3D2B1F]" />
            <span className="font-bold text-[#3D2B1F] text-lg tracking-tight">
              FlowStudio <span className="text-[#A07850]">AI</span>
            </span>
          </Link>
          <button
            className="lg:hidden text-[#7A6055]"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ label, to, icon: Icon, end }) => {
            const active = isActive(to, end);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-150
                  ${
                    active
                      ? "bg-[#3D2B1F] text-[#FAF7F4] shadow-sm"
                      : "text-[#7A6055] hover:bg-[#EDE5DC] hover:text-[#3D2B1F]"
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="px-3 py-4 border-t border-[#E8DDD4]">
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
              text-[#7A6055] hover:bg-[#EDE5DC] hover:text-[#3D2B1F] w-full transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* ──────────────────────────────────────────
          MAIN CONTENT
      ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* ── TOPBAR MOBILE ── */}
        <header className="lg:hidden sticky top-0 z-20 bg-[#FAF7F4] border-b border-[#E8DDD4] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-[#7A6055] hover:bg-[#EDE5DC]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#3D2B1F]" />
            <span className="font-bold text-[#3D2B1F] text-base tracking-tight">
              FlowStudio <span className="text-[#A07850]">AI</span>
            </span>
          </div>
          {/* Espaço para manter logo centralizado */}
          <div className="w-9" />
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* ──────────────────────────────────────────
          BOTTOM NAV — apenas mobile
      ────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#FAF7F4] border-t border-[#E8DDD4]">
        <div className="flex items-center justify-around px-2 py-2">
          {bottomNavItems.map(({ label, to, icon: Icon, end }) => {
            const active = isActive(to, end);
            return (
              <Link
                key={to}
                to={to}
                className={`
                  flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl
                  transition-all duration-150 min-w-[56px]
                  ${
                    active
                      ? "text-[#3D2B1F]"
                      : "text-[#B09888] hover:text-[#7A6055]"
                  }
                `}
              >
                <div
                  className={`
                    p-1.5 rounded-lg transition-all
                    ${active ? "bg-[#3D2B1F]" : ""}
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${active ? "text-[#FAF7F4]" : ""}`}
                  />
                </div>
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
