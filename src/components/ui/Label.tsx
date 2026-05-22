import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils/cn';

export interface LabelProps
  extends ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  required?: boolean;
}

export const Label = forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, required, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'text-sm font-medium text-neutral-700 leading-none',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className,
    )}
    {...props}
  >
    {children}
    {required ? (
      <span className="ml-0.5 text-red-500" aria-hidden="true">
        *
      </span>
    ) : null}
  </LabelPrimitive.Root>
));

Label.displayName = 'Label';
