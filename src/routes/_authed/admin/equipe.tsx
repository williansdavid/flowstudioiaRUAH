// src/routes/_authed/admin/equipe.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/admin/equipe')({
  component: EquipeLayout,
});

function EquipeLayout() {
  return <Outlet />;
}
