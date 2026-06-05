import { createFileRoute } from '@tanstack/react-router';
import { Scissors } from 'lucide-react';
import { PlaceholderScreen } from '@/features/admin-shell';

export const Route = createFileRoute('/_authed/admin/servicos')({
  staticData: { title: 'Serviços' },
  component: () => <PlaceholderScreen title="Serviços" icon={Scissors} />,
});
