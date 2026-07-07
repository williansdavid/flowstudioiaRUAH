import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog } from '@/features/utils/ui/Dialog';
import { listPaymentMethods } from '@/features/sales/server/listPaymentMethods';
import { listStaff } from '@/features/staff/server/listStaff';
import { createExpense } from '../server/createExpense';

const CATEGORY_OPTIONS = [
  { value: 'rent', label: 'Aluguel' },
  { value: 'utilities', label: 'Contas (água, luz, internet)' },
  { value: 'supplies', label: 'Suprimentos' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'salary', label: 'Salário' },
  { value: 'commission', label: 'Comissão (repasse manual)' },
  { value: 'other', label: 'Outro' },
] as const;

type CategoryValue = (typeof CATEGORY_OPTIONS)[number]['value'];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const inputClass =
  'w-full rounded-lg border border-slate-700/30 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-orange-500/50';
const labelClass = 'mb-1 block text-xs font-medium text-slate-400';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NewExpenseModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();

  const [category, setCategory] = useState<CategoryValue>('other');
  const [amount, setAmount] = useState('');
  const [occurredAt, setOccurredAt] = useState(todayISO);
  const [description, setDescription] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [staffId, setStaffId] = useState('');

  const paymentMethodsQuery = useQuery({
    queryKey: ['sales', 'paymentMethods'],
    queryFn: () => listPaymentMethods(),
    enabled: open,
    staleTime: 5 * 60_000,
  });

  const staffQuery = useQuery({
    queryKey: ['staff', 'list'],
    queryFn: () => listStaff({ data: {} }),
    enabled: open && category === 'commission',
    staleTime: 5 * 60_000,
  });

  function resetForm() {
    setCategory('other');
    setAmount('');
    setOccurredAt(todayISO());
    setDescription('');
    setPaymentMethodId('');
    setStaffId('');
  }

  const mutation = useMutation({
    mutationFn: () =>
      createExpense({
        data: {
          category,
          amount: Number(amount.replace(',', '.')),
          occurredAt,
          description: description.trim() || null,
          paymentMethodId: paymentMethodId || null,
          staffId: category === 'commission' ? staffId || null : null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      resetForm();
      onClose();
    },
  });

  const parsedAmount = Number(amount.replace(',', '.'));
  const isAmountValid = amount.trim() !== '' && !Number.isNaN(parsedAmount) && parsedAmount > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAmountValid) return;
    mutation.mutate();
  }

  function handleClose() {
    if (mutation.isPending) return;
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Nova despesa">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryValue)}
            className={inputClass}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Valor (R$)</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Data</label>
          <input
            type="date"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Descrição (opcional)</label>
          <input
            type="text"
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Conta de luz de junho"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Forma de pagamento (opcional)</label>
          <select
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(e.target.value)}
            className={inputClass}
          >
            <option value="">Não informado</option>
            {(paymentMethodsQuery.data ?? []).map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.name}
              </option>
            ))}
          </select>
        </div>

        {category === 'commission' ? (
          <div>
            <label className={labelClass}>Profissional</label>
            <select value={staffId} onChange={(e) => setStaffId(e.target.value)} className={inputClass}>
              <option value="">Selecione...</option>
              {(staffQuery.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {mutation.isError ? (
          <p className="text-xs text-red-400">
            {(mutation.error as { message?: string })?.message ?? 'Erro ao salvar despesa.'}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isAmountValid || mutation.isPending}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-orange-500/20 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? 'Salvando...' : 'Salvar despesa'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
