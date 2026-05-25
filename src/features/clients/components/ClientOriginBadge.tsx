import { Badge } from '@/components/ui';
import type { ClientOrigin } from '../types';

interface ClientOriginBadgeProps {
  origin: ClientOrigin;
}

/**
 * Badge visual indicando a origem do cliente:
 * - "account": cliente que criou conta (tem profile vinculado)
 * - "walkin":  cliente cadastrado pelo admin/staff (sem conta)
 */
export function ClientOriginBadge({ origin }: ClientOriginBadgeProps) {
  if (origin === 'account') {
    return <Badge variant="info">Com conta</Badge>;
  }
  return <Badge variant="muted">Walk-in</Badge>;
}
