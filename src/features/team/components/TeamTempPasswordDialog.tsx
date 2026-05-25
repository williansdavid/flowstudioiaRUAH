import { useState } from 'react';
import { Check, Copy, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, Button } from '@/components/ui';
import type { CreateStaffResult } from '../types';

interface TeamTempPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: CreateStaffResult | null;
}

export function TeamTempPasswordDialog({
  open,
  onOpenChange,
  result,
}: TeamTempPasswordDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.tempPassword);
      setCopied(true);
      toast.success('Senha copiada');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Falha ao copiar — copie manualmente');
    }
  };

  if (!result) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="max-w-md">
          <Dialog.Header>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <KeyRound className="h-5 w-5 text-amber-700" />
              </div>
              <Dialog.Title>Senha temporária gerada</Dialog.Title>
            </div>
            <Dialog.Description>
              Compartilhe com o membro <strong>{result.email}</strong>. Esta
              senha não será exibida novamente.
            </Dialog.Description>
          </Dialog.Header>

          <div className="my-4">
            <div className="flex items-center gap-2 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2.5">
              <code className="flex-1 select-all font-mono text-sm text-neutral-900">
                {result.tempPassword}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                aria-label="Copiar senha"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              💡 O membro deve trocar a senha no primeiro acesso.
            </p>
          </div>

          <Dialog.Footer>
            <Button onClick={() => onOpenChange(false)}>Entendi</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
