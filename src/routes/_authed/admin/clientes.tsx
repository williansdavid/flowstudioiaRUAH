import { createFileRoute } from '@tanstack/react-router';
import { Users } from 'lucide-react';
import { PlaceholderScreen } from '@/features/admin-shell';

export const Route = createFileRoute('/_authed/admin/clientes')({
  staticData: { title: 'Clientes' },
  component: () => <PlaceholderScreen title="Clientes" icon={Users} />,
});
