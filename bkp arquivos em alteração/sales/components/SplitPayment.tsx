import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { PaymentMethodItem, SplitPayment } from '../types';
import { PaymentRow } from './PaymentRow';

interface SplitPaymentProps {
  methods: PaymentMethodItem[];
  payments: SplitPayment[];
  total: number;
  onAddPayment: (payment: SplitPayment) => void;
  onRemovePayment: (paymentMethodId: string) => void;  // <-- mudou
}

export function SplitPaymentSection({
  methods,
  payments,
  total,
  onAddPayment,
  onRemovePayment,
}: SplitPaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState(methods[0]?.id ?? '');
  const [amount, setAmount] = useState('');


  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - paid;
  const isComplete = Math.abs(remaining) < 0.01;

  function handleAdd() {
    const method = methods.find((m) => m.id === selectedMethod);
    if (!method) return;
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return;
    if (value > remaining + 0.01) return;

    onAddPayment({
      paymentMethodId: method.id,
      paymentMethodName: method.name,
      amount: value,
    });
    setAmount('');
  }
  useEffect(() => {
    if (remaining > 0 && remaining < total) {
      setAmount(remaining.toFixed(2));
    } else if (remaining > 0) {
      setAmount(remaining.toFixed(2));
    }
  }, [remaining, total]);  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-slate-300">
        Formas de pagamento
      </h4>

      <div className="space-y-2">
        {payments.map((p, i) => (
          <PaymentRow key={p.paymentMethodId} payment={p} onRemove={onRemovePayment} />
        ))}
      </div>

      {!isComplete && (
        <div className="flex items-center gap-2">
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="rounded-lg border border-slate-700/20 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-orange-500/40"
          >
            {methods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            min="0"
            max={remaining}
            placeholder={`R$ ${remaining.toFixed(2)}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-28 rounded-lg border border-slate-700/20 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-orange-500/40"
          />
          <button
            onClick={handleAdd}
            disabled={!amount || parseFloat(amount) <= 0}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white transition-colors hover:bg-orange-600 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">
          {isComplete
            ? '✅ Pagamento completo'
            : `Faltam R$ ${remaining.toFixed(2)}`}
        </span>
        <span className="text-slate-400">
          Pago: R$ {paid.toFixed(2)}
        </span>
      </div>
    </div>
  );
}