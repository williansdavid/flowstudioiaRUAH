// src/components/ui/ConfirmDialog.tsx
import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TriangleAlert, X } from 'lucide-react';
import { Button, type ButtonVariant } from './Button';
import { cn } from '@/lib/cn';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
  icon?: ReactNode;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  isLoading = false,
  icon,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={overlayVariants}
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            className={cn(
              'relative w-full max-w-md rounded-2xl border border-border/60 bg-surface/95 p-6 shadow-2xl',
              'flex flex-col gap-5',
            )}
            variants={dialogVariants}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-alt hover:text-text-body"
            >
              <X className="h-4 w-4" />
            </button>

            {icon ?? (
              <div
                className={cn(
                  'mx-auto flex h-14 w-14 items-center justify-center rounded-full',
                  variant === 'danger' && 'bg-danger/10 text-danger',
                  variant === 'success' && 'bg-success/10 text-success',
                  variant === 'primary' && 'bg-accent/10 text-accent',
                )}
              >
                <TriangleAlert className="h-7 w-7" />
              </div>
            )}

            <div className="flex flex-col gap-2 text-center">
              <h2
                id="confirm-title"
                className="text-lg font-bold text-text-heading"
              >
                {title}
              </h2>
              <p
                id="confirm-desc"
                className="text-sm leading-relaxed text-text-muted"
              >
                {description}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                {cancelLabel}
              </Button>
              <Button
                variant={variant}
                onClick={onConfirm}
                isLoading={isLoading}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}