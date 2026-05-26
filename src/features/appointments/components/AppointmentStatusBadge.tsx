import { Badge } from "@/components/ui";
import type { AppointmentStatus } from "../types";
import {
  APPOINTMENT_STATUS_LABEL,
  APPOINTMENT_STATUS_VARIANT,
} from "../utils/status";

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

/**
 * Badge visual indicando o status do agendamento.
 * Label e variante vem de uma fonte unica em utils/status.ts
 */
export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  return (
    <Badge variant={APPOINTMENT_STATUS_VARIANT[status]}>
      {APPOINTMENT_STATUS_LABEL[status]}
    </Badge>
  );
}

