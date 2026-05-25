import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card branco que envolve o conteúdo do form de autenticação.
 * Em mobile usa borda sutil; em desktop fica clean (sem card visível)
 * já que o split-screen já dá contraste visual.
 */
export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        'w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200',
        'sm:p-8',
        'lg:bg-transparent lg:p-0 lg:shadow-none lg:ring-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
