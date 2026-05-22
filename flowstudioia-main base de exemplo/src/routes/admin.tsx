// app/routes/admin.tsx
import { redirect } from "react-router";
import type { Route } from "./+types/admin";
import AdminLayout from "~/components/admin/AdminLayout";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request); // sua função de sessão

  if (!session?.user) throw redirect("/login");
  if (session.user.role !== "admin") throw redirect("/");

  return { user: session.user };
}

export default function Admin() {
  return <AdminLayout />;
}
