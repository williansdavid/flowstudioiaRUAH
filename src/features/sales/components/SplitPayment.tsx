// src/features/sales/components/SplitPayment.tsx
import { useState, useEffect } from 'react';
import { Plus, ArrowLeftRight } from 'lucide-react';
import type { PaymentMethodItem, SplitPayment } from '../types';
import { PaymentRow } from './PaymentRow';

interface SplitPaymentProps {
  methods: PaymentMethodItem[];
  payments: SplitPayment[];
  total: number;
  onAddPayment: (payment: SplitPayment) => void;
  onRemovePayment: (paymentMethodId: string) => void;
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
  const [cashChange, setCashChange] = useState(0);

  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - paid;
  const isComplete = Math.abs(remaining) < 0.01;

  const cashMethod = methods.find(
    (m) => m.name.toLowerCase() === 'dinheiro',
  );
  const selectedIsCash =
    methods.find((m) => m.id === selectedMethod)?.name.toLowerCase() === 'dinheiro';

  const inputMax = selectedIsCash ? undefined : Math.max(0, remaining);

  function handleAdd() {
    const method = methods.find((m) => m.id === selectedMethod);
    if (!method) return;
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return;

    const methodIsCash = method.name.toLowerCase() === 'dinheiro';

    // Outros métodos nunca ultrapassam o remaining
    if (!methodIsCash && value > remaining + 0.01) return;

    // Dinheiro pode exceder: registra só o necessário, resto vira troco
    const finalAmount = methodIsCash && value > remaining ? remaining : value;

    onAddPayment({
      paymentMethodId: method.id,
      paymentMethodName: method.name,
      amount: finalAmount,
    });

    setCashChange(methodIsCash && value > remaining ? value - remaining : 0);
    setAmount('');
  }

  // Reseta troco se pagamento em dinheiro for removido
  useEffect(() => {
    if (cashChange <= 0) return;
    const cashStillPresent = cashMethod
      ? payments.some((p) => p.paymentMethodId === cashMethod.id)
      : false;
    if (!cashStillPresent) setCashChange(0);
  }, [payments, cashMethod, cashChange]);

  useEffect(() => {
    if (remaining > 0) {
      setAmount(remaining.toFixed(2));
    }
  }, [remaining, total]);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-slate-300">
        Formas de pagamento
      </h4>

      <div className="space-y-2">
        {payments.map((p) => (
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
            max={inputMax}
            placeholder={`R$ ${remaining.toFixed(2)}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
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
          {cashChange > 0 ? (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ArrowLeftRight className="h-4 w-4" />
              Troco: R$ {cashChange.toFixed(2)}
            </span>
          ) : isComplete ? (
            '✅ Pagamento completo'
          ) : (
            `Faltam R$ ${remaining.toFixed(2)}`
          )}
        </span>
        <span className="text-slate-400">
          Pago: R$ {paid.toFixed(2)}
        </span>
      </div>
    </div>
  );
}