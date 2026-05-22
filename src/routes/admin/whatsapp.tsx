import { createFileRoute } from '@tanstack/react-router';
import { requirePermission } from '@/lib/auth/session';

export const Route = createFileRoute('/admin/whatsapp')({
  beforeLoad: ({ context }) => {
    requirePermission(context.user, 'whatsapp.view');
  },
  component: WhatsAppRouteComponent,
});

function WhatsAppRouteComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-zinc-900">WhatsApp</h1>
      <p className="text-zinc-600 mt-2">
        Configure a integração e visualize as conversas.
      </p>
    </div>
  );
}
