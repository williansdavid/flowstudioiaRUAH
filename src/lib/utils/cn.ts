import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes Tailwind de forma segura.
 * - Concatena condicionalmente (clsx)
 * - Resolve conflitos de Tailwind (twMerge)
 *
 * @example
 * cn('p-2', condition && 'p-4', 'bg-white')
 * // condition=true -> "p-4 bg-white"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
