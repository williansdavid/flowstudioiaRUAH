import { type ReactNode } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

/**
 * Diálogo de confirmação pronto para uso.
 *
 * @example
 * const [open, setOpen] = useState(false);
 *
 * <ConfirmDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Excluir cliente?"
 *   description="Essa ação não pode ser desfeita."
 *   variant="danger"
 *   confirmLabel="Excluir"
 *   onConfirm={async () => { await deleteClient(id); }}
 * />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
          {description ? (
            <Dialog.Description>{description}</Dialog.Description>
          ) : null}
        </Dialog.Header>

        <Dialog.Footer>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
