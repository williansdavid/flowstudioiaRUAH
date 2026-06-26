// src/features/sales/components/PaymentRow.tsx
import { X } from 'lucide-react';
import type { SplitPayment } from '../types';

interface PaymentRowProps {
  payment: SplitPayment;
  onRemove: (paymentMethodId: string) => void;  // <-- mudou de number pra string
}

export function PaymentRow({ payment, onRemove }: PaymentRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-700/20 bg-slate-800/30 px-3 py-2">
      <span className="text-sm text-slate-300">{payment.paymentMethodName}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-orange-400">
          R$ {payment.amount.toFixed(2)}
        </span>
        <button
          onClick={() => onRemove(payment.paymentMethodId)}
          className="flex h-5 w-5 items-center justify-center rounded text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}