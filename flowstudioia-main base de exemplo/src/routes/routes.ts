// app/routes.ts
import { type RouteConfig, route, index, layout } from "@react-router/dev/routes";

export default [
  // Landing pública
  index("routes/home.tsx"),

  // Admin com layout protegido
  route("admin", "routes/admin.tsx", [
    index("routes/admin/admin.index.tsx"),           // /admin
    route("agenda",        "routes/admin/agenda.tsx"),
    route("clientes",      "routes/admin/clientes.tsx"),
    route("staff",         "routes/admin/staff.tsx"),
    route("servicos",      "routes/admin/servicos.tsx"),
    route("finance",       "routes/admin/finance.tsx"),
    route("whatsapp",      "routes/admin/whatsapp.tsx"),
    route("configuracoes", "routes/admin/configuracoes.tsx"),
  ]),

  // Auth
  route("login",  "routes/auth/login.tsx"),
  route("logout", "routes/auth/logout.tsx"),
] satisfies RouteConfig;
