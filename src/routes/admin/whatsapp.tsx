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
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">WhatsApp</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Configure a integração e visualize as conversas.
      </p>
    </div>
  );
}
