// src/features/sales/components/CartFloatingFooter.tsx
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartFloatingFooterProps {
  itemCount: number;
  total: number;
  onClick: () => void;
}

export function CartFloatingFooter({ itemCount, total, onClick }: CartFloatingFooterProps) {
  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700/30 bg-slate-900/95 px-4 py-3 backdrop-blur-lg lg:hidden"
        >
          <button
            onClick={onClick}
            className="flex w-full items-center justify-between rounded-xl bg-orange-500 px-5 py-3 transition-colors hover:bg-orange-600 active:scale-[0.98]"
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6 text-white" />
              <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                {itemCount}
              </span>
            </div>
            <span className="text-sm font-medium text-white/90">
              Ver carrinho
            </span>
            <span className="text-lg font-bold text-white">
              R$ {total.toFixed(2)}
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}