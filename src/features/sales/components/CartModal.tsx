// src/features/sales/components/CartModal.tsx
import * as Dialog from '@radix-ui/react-dialog';
import { X, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartPanel } from './CartPanel';
import { SplitPaymentSection } from './SplitPayment';
import { Button } from '@/features/utils/ui/Button';
import type { CartItem, SplitPayment, PaymentMethodItem } from '../types';

interface CartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  total: number;
  payments: SplitPayment[];
  paymentMethods: PaymentMethodItem[];
  isComplete: boolean;
  isFinalizing: boolean;
  canEdit: boolean;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onAddPayment: (payment: SplitPayment) => void;
  onRemovePayment: (paymentMethodId: string) => void;
  onFinalize: () => void;
}

export function CartModal({
  open,
  onOpenChange,
  items,
  total,
  payments,
  paymentMethods,
  isComplete,
  isFinalizing,
  canEdit,
  onIncrement,
  onDecrement,
  onRemove,
  onAddPayment,
  onRemovePayment,
  onFinalize,
}: CartModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl border-t border-slate-700/30 bg-slate-900 p-0 shadow-2xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700/20 px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-orange-400" />
                <span className="text-sm font-medium text-slate-200">
                  Carrinho ({items.length} {items.length === 1 ? 'item' : 'itens'})
                </span>
              </div>
              <Dialog.Close asChild>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-slate-200">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* Body — scrollável */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-8 text-center text-sm text-slate-500"
                  >
                    Carrinho vazio.
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
                <>
                  {/* Total */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-700/20 pt-3">
                    <span className="text-sm text-slate-400">Total</span>
                    <span className="text-lg font-bold text-orange-400">
                      R$ {total.toFixed(2)}
                    </span>
                  </div>

                  {/* Split */}
                  <div className="mt-6">
                    <SplitPaymentSection
                      methods={paymentMethods}
                      payments={payments}
                      total={total}
                      onAddPayment={onAddPayment}
                      onRemovePayment={onRemovePayment}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer — fixo no fundo do modal */}
            {items.length > 0 && (
              <div className="border-t border-slate-700/20 px-5 py-4">
                <Button
                  onClick={onFinalize}
                  isLoading={isFinalizing}
                  disabled={!isComplete}
                  className="w-full"
                  size="lg"
                >
                  Finalizar venda — R$ {total.toFixed(2)}
                </Button>
              </div>
            )}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Import necessário — o CartItemRow usado acima
import { CartItemRow } from './CartItem';