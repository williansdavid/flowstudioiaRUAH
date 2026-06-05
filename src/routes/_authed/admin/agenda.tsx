import { createFileRoute } from '@tanstack/react-router';
import { CalendarDays } from 'lucide-react';
import { PlaceholderScreen } from '@/features/admin-shell';

export const Route = createFileRoute('/_authed/admin/agenda')({
  staticData: { title: 'Agenda' },
  component: () => <PlaceholderScreen title="Agenda" icon={CalendarDays} />,
});
