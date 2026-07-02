import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { TransactionItem } from '../types';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const CATEGORY_LABELS: Record<TransactionItem['category'], string> = {
  service: 'Serviço',
  product: 'Produto',
  commission: 'Comissão',
  rent: 'Aluguel',
  utilities: 'Contas',
  supplies: 'Suprimentos',
  marketing: 'Marketing',
  salary: 'Salário',
  other: 'Outro',
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Props {
  transactions: TransactionItem[];
}

export function RecentTransactionsList({ transactions }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-700/20 bg-slate-800/40 text-sm text-slate-500">
        Nenhuma transação no período
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/20 bg-slate-800/40 p-5 shadow-md">
      <p className="mb-4 text-sm font-semibold text-slate-200">Últimas transações</p>
      <div className="divide-y divide-slate-700/20">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'income';
          const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle;
          return (
            <div key={tx.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Icon
                  className={cn('h-5 w-5 shrink-0', isIncome ? 'text-emerald-400' : 'text-red-400')}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {CATEGORY_LABELS[tx.category]}
                    {tx.staffName ? ` · ${tx.staffName}` : ''}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {formatDateTime(tx.occurredAt)}
                    {tx.paymentMethodName ? ` · ${tx.paymentMethodName}` : ''}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  'shrink-0 text-sm font-semibold',
                  isIncome ? 'text-emerald-400' : 'text-red-400',
                )}
              >
                {isIncome ? '+' : '-'}
                {brl.format(tx.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
