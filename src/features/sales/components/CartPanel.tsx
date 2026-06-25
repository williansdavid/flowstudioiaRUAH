import { ShoppingCart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CartItem as CartItemType } from '../types';
import { CartItemRow } from './CartItem';

interface CartPanelProps {
  items: CartItemType[];
  total: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  canEdit: boolean;
}

export function CartPanel({
  items,
  total,
  onIncrement,
  onDecrement,
  onRemove,
  canEdit,
}: CartPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-orange-400" />
        <span className="text-sm font-medium text-slate-300">
          Carrinho ({items.length} {items.length === 1 ? 'item' : 'itens'})
        </span>
      </div>
      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 text-center text-sm text-slate-500"
          >
            Carrinho vazio. Selecione produtos ao lado.
          </motion.p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CartItemRow
                  item={item}
                  onIncrement={onIncrement}
                  onDecrement={onDecrement}
                  onRemove={onRemove}
                  canEdit={canEdit}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
      {items.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-700/20 pt-3">
          <span className="text-sm text-slate-400">Total</span>
          <span className="text-lg font-bold text-orange-400">
            R$ {total.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}