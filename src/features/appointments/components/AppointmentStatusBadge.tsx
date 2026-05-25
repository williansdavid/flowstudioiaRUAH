import { Badge } from "@/components/ui";
import type { AppointmentStatus } from "../types";
import { APPOINTMENT_STATUS_LABEL } from "../utils/status";

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

type Variant = "default" | "success" | "warning" | "danger" | "info" | "muted";

const statusVariant: Record<AppointmentStatus, Variant> = {
  pending: "warning",
  confirmed: "info",
  completed: "success",
  cancelled: "danger",
  no_show: "muted",
};

/**
 * Badge visual indicando o status do agendamento.
 * Cores seguem convencao visual padrao do projeto.
 */
export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  return (
    <Badge variant={statusVariant[status]}>
      {APPOINTMENT_STATUS_LABEL[status]}
    </Badge>
  );
}