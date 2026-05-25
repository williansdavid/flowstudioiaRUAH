import { useEffect, useState, type FormEvent } from 'react';
import { Dialog, Button, Input, Label, Switch, Textarea } from '@/components/ui';
import { useCreateTeamMember, useUpdateTeamMember } from '../hooks';
import type {
  CreateStaffResult,
  TeamMember,
} from '../types';

interface TeamMemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Quando preenchido → modo edição. Quando null → modo criação. */
  member: TeamMember | null;
  /** Callback após criação bem-sucedida (para abrir o dialog de senha temporária). */
  onCreated?: (result: CreateStaffResult) => void;
}

type FormState = {
  email: string;
  fullName: string;
  phone: string;
  role: 'admin' | 'staff';
  specialty: string;
  bio: string;
  commissionRate: string;
  isBookable: boolean;
};

const EMPTY_FORM: FormState = {
  email: '',
  fullName: '',
  phone: '',
  role: 'staff',
  specialty: '',
  bio: '',
  commissionRate: '',
  isBookable: true,
};

export function TeamMemberFormDialog({
  open,
  onOpenChange,
  member,
  onCreated,
}: TeamMemberFormDialogProps) {
  const isEdit = member !== null;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const createMutation = useCreateTeamMember();
  const updateMutation = useUpdateTeamMember();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open && member) {
      setForm({
        email: member.email,
        fullName: member.fullName ?? '',
        phone: member.phone ?? '',
        role: member.role,
        specialty: member.specialty ?? '',
        bio: member.bio ?? '',
        commissionRate:
          member.commissionRate !== null
            ? String(member.commissionRate)
            : '',
        isBookable: member.isBookable ?? true,
      });
    } else if (open && !member) {
      setForm(EMPTY_FORM);
    }
  }, [open, member]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // ⚠️ Helper: string vazia vira undefined (campo omitido do payload).
    // Server-side, o Zod converte vazio em null quando necessário.
    const optStr = (v: string) => {
      const trimmed = v.trim();
      return trimmed === '' ? undefined : trimmed;
    };

    const commissionRateNum = form.commissionRate.trim()
      ? Number(form.commissionRate)
      : undefined;

    if (isEdit && member) {
      await updateMutation.mutateAsync({
        profileId: member.profileId,
        fullName: optStr(form.fullName),
        phone: optStr(form.phone),
        specialty: optStr(form.specialty),
        bio: optStr(form.bio),
        commissionRate: commissionRateNum,
        isBookable: form.isBookable,
      });
      onOpenChange(false);
    } else {
      const result = await createMutation.mutateAsync({
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        phone: optStr(form.phone),
        role: form.role,
        specialty: optStr(form.specialty),
        // create-staff não tem `bio` no schema (confirmar) — omitido
        commissionRate: commissionRateNum,
        isBookable: form.isBookable,
      });
      onOpenChange(false);
      onCreated?.(result);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="max-w-lg">
          <Dialog.Header>
            <Dialog.Title>
              {isEdit ? 'Editar membro' : 'Novo membro'}
            </Dialog.Title>
            <Dialog.Description>
              {isEdit
                ? 'Atualize as informações do membro.'
                : 'Uma senha temporária será gerada após a criação.'}
            </Dialog.Description>
          </Dialog.Header>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {!isEdit && (
              <div className="space-y-1.5">
                <Label htmlFor="email" required>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="off"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="fullName" required={!isEdit}>
                Nome completo
              </Label>
              <Input
                id="fullName"
                required={!isEdit}
                value={form.fullName}
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>

              {!isEdit && (
                <div className="space-y-1.5">
                  <Label htmlFor="role" required>
                    Função
                  </Label>
                  <select
                    id="role"
                    value={form.role}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        role: e.target.value as 'admin' | 'staff',
                      })
                    }
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                  >
                    <option value="staff">Profissional</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="specialty">Especialidade</Label>
              <Input
                id="specialty"
                placeholder="Ex: Cabelereiro, Manicure..."
                value={form.specialty}
                onChange={(e) =>
                  setForm({ ...form, specialty: e.target.value })
                }
              />
            </div>

            {/* Bio: só na edição (create-staff não aceita bio conforme erro de tipos) */}
            {isEdit && (
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="commissionRate">Comissão (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.commissionRate}
                  onChange={(e) =>
                    setForm({ ...form, commissionRate: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2">
                <Label htmlFor="isBookable" className="mb-0">
                  Agendável
                </Label>
                <Switch
                  id="isBookable"
                  checked={form.isBookable}
                  onCheckedChange={(v) =>
                    setForm({ ...form, isBookable: v })
                  }
                />
              </div>
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
              <Button type="submit" loading={isPending}>
                {isEdit ? 'Salvar alterações' : 'Criar membro'}
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
