import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Dialog,
  Button,
  Input,
  Label,
  Textarea,
} from "@/components/ui";
import { useCreateAppointment } from "../hooks";
import { useClients } from "@/features/clients/hooks";
import { useTeamMembers } from "@/features/team/hooks";
import { useServices } from "@/features/services/hooks";

interface AppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormState = {
  clientId: string;
  staffId: string;
  serviceId: string;
  startsAt: string;       // "YYYY-MM-DDTHH:mm" (datetime-local)
  status: "pending" | "confirmed";
  priceOverride: string;  // string vazia = usar preco do servico
  notes: string;
};

const EMPTY_FORM: FormState = {
  clientId: "",
  staffId: "",
  serviceId: "",
  startsAt: "",
  status: "confirmed",
  priceOverride: "",
  notes: "",
};

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm " +
  "ring-offset-white placeholder:text-neutral-500 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Dialog para criar novo agendamento (admin).
 *
 * Notas:
 *  - Apenas modo CREATE (edicao virá em iteracao futura).
 *  - startsAt convertido de "datetime-local" -> ISO no submit.
 *  - priceOverride vazio -> envia null (server usa preco do servico).
 *  - notes vazia -> envia null.
 *  - Staff filtrado: staffId != null, isActive, isBookable.
 *  - Servicos filtrados: isActive.
 *  - Erro de conflito de horario ja eh tratado no hook (toast).
 */
export function AppointmentFormDialog({
  open,
  onOpenChange,
}: AppointmentFormDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const createMutation = useCreateAppointment();
  const isPending = createMutation.isPending;

  const clientsQuery = useClients();
  const teamQuery = useTeamMembers();
  const servicesQuery = useServices();

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
    }
  }, [open]);

  // Staff agendavel: tem registro em staff, ativo e bookable
  const bookableStaff = useMemo(() => {
    const list = teamQuery.data ?? [];
    return list.filter(
      (m) => m.staffId !== null && m.isActive && m.isBookable === true,
    );
  }, [teamQuery.data]);

  // Servicos ativos
  const activeServices = useMemo(() => {
    const list = servicesQuery.data ?? [];
    return list.filter((s) => s.isActive);
  }, [servicesQuery.data]);

  // Clientes ordenados por nome
  const clients = useMemo(() => {
    const list = clientsQuery.data ?? [];
    return [...list].sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [clientsQuery.data]);

  const isLoadingDeps =
    clientsQuery.isLoading || teamQuery.isLoading || servicesQuery.isLoading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.clientId || !form.staffId || !form.serviceId || !form.startsAt) {
      return;
    }

    // datetime-local -> ISO com timezone do browser
    const startsAtIso = new Date(form.startsAt).toISOString();

    // priceOverride: string vazia -> null; string valida -> number
    let priceOverride: number | null = null;
    if (form.priceOverride.trim() !== "") {
      const parsed = Number(form.priceOverride);
      if (!Number.isFinite(parsed) || parsed < 0) return;
      priceOverride = parsed;
    }

    const notes = form.notes.trim() === "" ? null : form.notes.trim();

    try {
      await createMutation.mutateAsync({
        clientId: form.clientId,
        staffId: form.staffId,
        serviceId: form.serviceId,
        startsAt: startsAtIso,
        status: form.status,
        priceOverride,
        notes,
      });
      onOpenChange(false);
    } catch {
      // Erro ja tratado via toast no hook; mantem dialog aberto pra correcao
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="max-w-lg">
          <Dialog.Header>
            <Dialog.Title>Novo agendamento</Dialog.Title>
            <Dialog.Description>
              Crie um agendamento para um cliente, profissional e servico.
            </Dialog.Description>
          </Dialog.Header>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Cliente */}
            <div className="space-y-1.5">
              <Label htmlFor="clientId" required>
                Cliente
              </Label>
              <select
                id="clientId"
                required
                className={SELECT_CLASS}
                value={form.clientId}
                disabled={clientsQuery.isLoading}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              >
                <option value="" disabled>
                  {clientsQuery.isLoading
                    ? "Carregando..."
                    : "Selecione um cliente"}
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.displayName}
                    {c.displayPhone ? ` — ${c.displayPhone}` : ""}
                  </option>
                ))}
              </select>
              {!clientsQuery.isLoading && clients.length === 0 && (
                <p className="text-xs text-neutral-500">
                  Nenhum cliente cadastrado.
                </p>
              )}
            </div>

            {/* Profissional */}
            <div className="space-y-1.5">
              <Label htmlFor="staffId" required>
                Profissional
              </Label>
              <select
                id="staffId"
                required
                className={SELECT_CLASS}
                value={form.staffId}
                disabled={teamQuery.isLoading}
                onChange={(e) => setForm({ ...form, staffId: e.target.value })}
              >
                <option value="" disabled>
                  {teamQuery.isLoading
                    ? "Carregando..."
                    : "Selecione um profissional"}
                </option>
                {bookableStaff.map((m) => (
                  <option key={m.staffId!} value={m.staffId!}>
                    {m.fullName ?? m.email}
                    {m.specialty ? ` — ${m.specialty}` : ""}
                  </option>
                ))}
              </select>
              {!teamQuery.isLoading && bookableStaff.length === 0 && (
                <p className="text-xs text-amber-600">
                  Nenhum profissional disponivel para agendamento.
                </p>
              )}
            </div>

            {/* Servico */}
            <div className="space-y-1.5">
              <Label htmlFor="serviceId" required>
                Servico
              </Label>
              <select
                id="serviceId"
                required
                className={SELECT_CLASS}
                value={form.serviceId}
                disabled={servicesQuery.isLoading}
                onChange={(e) =>
                  setForm({ ...form, serviceId: e.target.value })
                }
              >
                <option value="" disabled>
                  {servicesQuery.isLoading
                    ? "Carregando..."
                    : "Selecione um servico"}
                </option>
                {activeServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.durationMinutes}min — R$ {s.price.toFixed(2)}
                  </option>
                ))}
              </select>
              {!servicesQuery.isLoading && activeServices.length === 0 && (
                <p className="text-xs text-amber-600">
                  Nenhum servico ativo cadastrado.
                </p>
              )}
            </div>

            {/* Data e hora */}
            <div className="space-y-1.5">
              <Label htmlFor="startsAt" required>
                Data e hora
              </Label>
              <Input
                id="startsAt"
                type="datetime-local"
                required
                value={form.startsAt}
                onChange={(e) =>
                  setForm({ ...form, startsAt: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Status */}
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className={SELECT_CLASS}
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as "pending" | "confirmed",
                    })
                  }
                >
                  <option value="confirmed">Confirmado</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>

              {/* Preco override */}
              <div className="space-y-1.5">
                <Label htmlFor="priceOverride">Preco (opcional)</Label>
                <Input
                  id="priceOverride"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Usar preco do servico"
                  value={form.priceOverride}
                  onChange={(e) =>
                    setForm({ ...form, priceOverride: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes">Anotacoes</Label>
              <Textarea
                id="notes"
                rows={3}
                maxLength={2000}
                placeholder="Observacoes internas (opcional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <Dialog.Footer>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={isPending}
                disabled={isLoadingDeps}
              >
                Criar agendamento
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
