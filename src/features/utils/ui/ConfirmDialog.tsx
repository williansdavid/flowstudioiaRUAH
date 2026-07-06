// src\features\utils\ui\ConfirmDialog.tsx
import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TriangleAlert, X, CheckCircle, Info, AlertCircle } from 'lucide-react';
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
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10,
    filter: 'blur(10px)'
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    filter: 'blur(0px)'
  },
};

const variantIconMap: Record<string, typeof TriangleAlert> = {
  danger: AlertCircle,
  success: CheckCircle,
  primary: Info,
  warning: TriangleAlert,
};

type ColorConfig = { main: string; glow: string; bg: string };

const variantColorMap: Record<string, ColorConfig> = {
  danger: { 
    main: 'text-red-500', 
    glow: 'rgba(239, 68, 68, 0.15)', 
    bg: 'from-red-500/20 to-red-500/5' 
  },
  success: { 
    main: 'text-emerald-500', 
    glow: 'rgba(16, 185, 129, 0.15)', 
    bg: 'from-emerald-500/20 to-emerald-500/5' 
  },
  primary: { 
    main: 'text-indigo-500', 
    glow: 'rgba(99, 102, 241, 0.15)', 
    bg: 'from-indigo-500/20 to-indigo-500/5' 
  },
  warning: { 
    main: 'text-amber-500', 
    glow: 'rgba(245, 158, 11, 0.15)', 
    bg: 'from-amber-500/20 to-amber-500/5' 
  },
};

// Usando fallback direto para evitar erro de atribuição TS2322
const defaultColors: ColorConfig = { 
  main: 'text-indigo-500', 
  glow: 'rgba(99, 102, 241, 0.15)', 
  bg: 'from-indigo-500/20 to-indigo-500/5' 
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

  const IconComponent = variantIconMap[variant] ?? Info;
  const colors = variantColorMap[variant] ?? defaultColors;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Overlay - Ultra Smooth Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            variants={overlayVariants}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            onClick={onClose}
            aria-hidden
          />

          {/* Dialog Card - Premium Glassmorphism */}
          <motion.div
            className={cn(
              'relative w-full max-w-[440px] overflow-hidden rounded-[24px]',
              'border border-white/[0.08] bg-slate-900/80',
              'shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]',
              'backdrop-blur-2xl backdrop-saturate-150',
              'flex flex-col'
            )}
            variants={dialogVariants}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 25,
              mass: 1,
            }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
          >
            {/* Ambient Noise Texture Overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Top Highlight Bar */}
            <div 
              className="h-[1px] w-full shrink-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" 
              style={{ boxShadow: `0 0 20px 1px ${colors.glow}` }}
            />

            {/* Close Button - Refined Interaction */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-90"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Main Content Area */}
            <div className="relative flex flex-col items-center px-8 pt-10 pb-6 text-center">
              {/* Icon Container - Multi-layered Depth */}
              {icon ?? (
                <div className="relative mb-6">
                  {/* Outer Glow */}
                  <div 
                    className={cn(
                      'absolute inset-0 blur-2xl opacity-20 rounded-full',
                      colors.bg.split(' ')[0]
                    )} 
                  />
                  {/* Inner Container */}
                  <div
                    className={cn(
                      'relative flex h-16 w-16 items-center justify-center rounded-2xl',
                      'bg-gradient-to-br border border-white/10',
                      colors.bg,
                      'shadow-inner shadow-white/10'
                    )}
                  >
                    <IconComponent className={cn('h-8 w-8 drop-shadow-md', colors.main)} />
                  </div>
                </div>
              )}

              {/* Typography - High Contrast & Hierarchy */}
              <div className="space-y-3">
                <h2
                  id="confirm-title"
                  className="text-xl font-semibold tracking-tight text-white"
                >
                  {title}
                </h2>
                <div
                  id="confirm-desc"
                  className="max-w-[320px] text-[15px] leading-relaxed text-slate-400 font-medium"
                >
                  {description}
                </div>
              </div>
            </div>

            {/* Footer Actions - Elegant Spacing */}
            <div className="relative flex flex-col-reverse gap-3 p-6 pt-2 sm:flex-row sm:justify-end sm:px-8 sm:pb-8">
              <Button 
                variant="ghost" 
                onClick={onClose} 
                disabled={isLoading}
                className="h-11 px-6 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border-transparent transition-colors"
              >
                {cancelLabel}
              </Button>
              <Button
                variant={variant}
                onClick={onConfirm}
                isLoading={isLoading}
                className={cn(
                  "h-11 px-8 rounded-xl font-semibold transition-all duration-300",
                  "shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_20px_-4px_rgba(0,0,0,0.4)]",
                  "hover:translate-y-[-1px] active:translate-y-[0px]"
                )}
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