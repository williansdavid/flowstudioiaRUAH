import { useEffect, useState, type FormEvent } from 'react';
import {
  Dialog,
  Button,
  Input,
  Label,
  Switch,
  Textarea,
} from '@/components/ui';
import { useCreateService, useUpdateService } from '../hooks';
import type { AdminServiceItem } from '../types';

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Quando preenchido → edição. Null → criação. */
  service: AdminServiceItem | null;
}

type FormState = {
  name: string;
  description: string;
  category: string;
  price: string;
  durationMinutes: string;
  imageUrl: string;
  displayOrder: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  category: '',
  price: '',
  durationMinutes: '60',
  imageUrl: '',
  displayOrder: '',
  isActive: true,
};

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
}: ServiceFormDialogProps) {
  const isEdit = service !== null;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open && service) {
      setForm({
        name: service.name,
        description: service.description ?? '',
        category: service.category ?? '',
        price: String(service.price),
        durationMinutes: String(service.durationMinutes),
        imageUrl: service.imageUrl ?? '',
        displayOrder: String(service.displayOrder),
        isActive: service.isActive,
      });
    } else if (open && !service) {
      setForm(EMPTY_FORM);
    }
  }, [open, service]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // String vazia → null (campos opcionais)
    const optStr = (v: string): string | null => {
      const trimmed = v.trim();
      return trimmed === '' ? null : trimmed;
    };

    const price = Number(form.price);
    const durationMinutes = Number(form.durationMinutes);
    const displayOrder = form.displayOrder.trim()
      ? Number(form.displayOrder)
      : undefined;

    // Validação client-side básica (server faz validação completa via Zod)
    if (!Number.isFinite(price) || price < 0) {
      return;
    }
    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      return;
    }

    if (isEdit && service) {
      await updateMutation.mutateAsync({
        id: service.id,
        patch: {
          name: form.name.trim(),
          description: optStr(form.description),
          category: optStr(form.category),
          price,
          durationMinutes,
          imageUrl: optStr(form.imageUrl),
          isActive: form.isActive,
          ...(displayOrder !== undefined && { displayOrder }),
        },
      });
      onOpenChange(false);
    } else {
      await createMutation.mutateAsync({
        name: form.name.trim(),
        description: optStr(form.description),
        category: optStr(form.category),
        price,
        durationMinutes,
        imageUrl: optStr(form.imageUrl),
        isActive: form.isActive,
        ...(displayOrder !== undefined && { displayOrder }),
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="max-w-lg">
          <Dialog.Header>
            <Dialog.Title>
              {isEdit ? 'Editar serviço' : 'Novo serviço'}
            </Dialog.Title>
            <Dialog.Description>
              {isEdit
                ? 'Atualize as informações do serviço.'
                : 'Adicione um novo serviço ao catálogo do studio.'}
            </Dialog.Description>
          </Dialog.Header>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" required>
                Nome
              </Label>
              <Input
                id="name"
                required
                minLength={2}
                maxLength={120}
                placeholder="Ex: Corte feminino"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                rows={3}
                maxLength={2000}
                placeholder="Detalhes do serviço (opcional)"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  maxLength={80}
                  placeholder="Ex: Cabelo"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="displayOrder">Ordem de exibição</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="0"
                  max="99999"
                  step="1"
                  placeholder="0"
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm({ ...form, displayOrder: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="price" required>
                  Preço (R$)
                </Label>
                <Input
                  id="price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="durationMinutes" required>
                  Duração (min)
                </Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  required
                  min="1"
                  max="1440"
                  step="1"
                  placeholder="60"
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm({ ...form, durationMinutes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="imageUrl">URL da imagem</Label>
              <Input
                id="imageUrl"
                type="url"
                maxLength={500}
                placeholder="https://..."
                value={form.imageUrl}
                onChange={(e) =>
                  setForm({ ...form, imageUrl: e.target.value })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2">
              <Label htmlFor="isActive" className="mb-0">
                Ativo (visível na landing)
              </Label>
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
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
              <Button type="submit" loading={isPending}>
                {isEdit ? 'Salvar alterações' : 'Criar serviço'}
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
