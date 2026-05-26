import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ErrorStateProps {
  message: string;
  className?: string;
}

export function ErrorState({ message, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border border-feedback-error/30',
        'bg-feedback-error/5 px-4 py-3 text-sm text-feedback-error',
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
}
