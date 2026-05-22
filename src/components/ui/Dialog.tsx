import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
} from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Dialog composto sobre Radix UI.
 *
 * Uso:
 * <Dialog.Root open={open} onOpenChange={setOpen}>
 *   <Dialog.Content>
 *     <Dialog.Header>
 *       <Dialog.Title>Título</Dialog.Title>
 *       <Dialog.Description>Descrição opcional</Dialog.Description>
 *     </Dialog.Header>
 *     <div>conteúdo...</div>
 *     <Dialog.Footer>
 *       <Button>Confirmar</Button>
 *     </Dialog.Footer>
 *   </Dialog.Content>
 * </Dialog.Root>
 */

const Root = DialogPrimitive.Root;
const Trigger = DialogPrimitive.Trigger;
const Portal = DialogPrimitive.Portal;
const Close = DialogPrimitive.Close;

const Overlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
      className,
    )}
    {...props}
  />
));
Overlay.displayName = 'Dialog.Overlay';

interface ContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
}

const Content = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ContentProps
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <Portal>
    <Overlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
        'w-full max-w-lg max-h-[90vh] overflow-y-auto',
        'bg-white rounded-xl shadow-xl border border-neutral-200',
        'p-6 focus:outline-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
        'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton ? (
        <DialogPrimitive.Close
          className={cn(
            'absolute right-4 top-4 rounded-md p-1 text-neutral-500',
            'hover:bg-neutral-100 hover:text-neutral-900 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1',
          )}
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      ) : null}
    </DialogPrimitive.Content>
  </Portal>
));
Content.displayName = 'Dialog.Content';

const Header = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col gap-1.5 mb-4 pr-8', className)}
    {...props}
  />
);
Header.displayName = 'Dialog.Header';

const Footer = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6',
      className,
    )}
    {...props}
  />
);
Footer.displayName = 'Dialog.Footer';

const Title = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-neutral-900', className)}
    {...props}
  />
));
Title.displayName = 'Dialog.Title';

const Description = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-neutral-600', className)}
    {...props}
  />
));
Description.displayName = 'Dialog.Description';

export const Dialog = {
  Root,
  Trigger,
  Portal,
  Overlay,
  Content,
  Header,
  Footer,
  Title,
  Description,
  Close,
};
