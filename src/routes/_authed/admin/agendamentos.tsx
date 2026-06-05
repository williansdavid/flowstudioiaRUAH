import { createFileRoute } from '@tanstack/react-router';
import { ClipboardList } from 'lucide-react';
import { PlaceholderScreen } from '@/features/admin-shell';

export const Route = createFileRoute('/_authed/admin/agendamentos')({
  staticData: { title: 'Agendamentos' },
  component: () => (
    <PlaceholderScreen title="Agendamentos" icon={ClipboardList} />
  ),
});
