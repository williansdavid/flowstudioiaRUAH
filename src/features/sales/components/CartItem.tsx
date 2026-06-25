import { Minus, Plus, Lock, Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '../types';

interface CartItemProps {
  item: CartItemType;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  canEdit: boolean;
}

export function CartItemRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  canEdit,
}: CartItemProps) {
  const isLocked = item.isLocked && !canEdit;

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-700/20 bg-slate-800/30 p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-slate-200">
            {item.itemName}
          </span>
          {item.isLocked && (
            <Lock className="h-3 w-3 shrink-0 text-slate-500" />
          )}
        </div>
        <span className="text-xs text-slate-400">
          R$ {item.unitPrice.toFixed(2)} cada
        </span>
      </div>
      <div className="flex items-center gap-3">
        {!isLocked ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDecrement(item.id)}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-700/30 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-slate-200"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-sm font-medium text-slate-200">
              {item.quantity}
            </span>
            <button
              onClick={() => onIncrement(item.id)}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-700/30 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-slate-200"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <span className="text-sm font-medium text-slate-400">
            x{item.quantity}
          </span>
        )}
        <span className="w-16 text-right text-sm font-semibold text-orange-400">
          R$ {item.totalPrice.toFixed(2)}
        </span>
        {(
          <button
            onClick={() => onRemove(item.id)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}