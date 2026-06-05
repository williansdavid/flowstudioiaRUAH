import { createFileRoute } from '@tanstack/react-router';
import { UserCog } from 'lucide-react';
import { PlaceholderScreen } from '@/features/admin-shell';

export const Route = createFileRoute('/_authed/admin/equipe')({
  component: () => <PlaceholderScreen title="Equipe" icon={UserCog} />,
});
