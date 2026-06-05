import { createFileRoute } from '@tanstack/react-router';
import { Wallet } from 'lucide-react';
import { PlaceholderScreen } from '@/features/admin-shell';

export const Route = createFileRoute('/_authed/admin/financeiro')({
  staticData: { title: 'Financeiro' },
  component: () => <PlaceholderScreen title="Financeiro" icon={Wallet} />,
});
