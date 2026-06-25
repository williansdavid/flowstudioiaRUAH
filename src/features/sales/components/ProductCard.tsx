// src/features/sales/components/ProductCard.tsx
import { motion } from 'framer-motion';
import { Package, Scissors } from 'lucide-react';
import type { ProductItem } from '../types';
import type { ServiceForSaleItem } from '../server/listServicesForSale';

type CatalogItem = ProductItem | (ServiceForSaleItem & { avatarUrl?: null });

interface ProductCardProps {
  item: CatalogItem;
  type: 'product' | 'service';
  onAdd: (item: CatalogItem) => void;
}

export function ProductCard({ item, type, onAdd }: ProductCardProps) {
  const isService = type === 'service';
  const serviceItem = isService ? (item as ServiceForSaleItem) : null;

  return (
    <motion.button
      layout
      onClick={() => onAdd(item)}
      className="group relative flex flex-col items-center gap-2 rounded-xl border border-slate-700/20 bg-slate-800/40 p-4 text-center transition-colors hover:border-orange-500/40 hover:bg-slate-800/60 active:scale-95"
      whileTap={{ scale: 0.95 }}
    >
      {'avatarUrl' in item && item.avatarUrl ? (
        <img
          src={item.avatarUrl}
          alt={item.name}
          className="h-16 w-16 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-700/30">
          {isService ? (
            <Scissors className="h-8 w-8 text-slate-500" />
          ) : (
            <Package className="h-8 w-8 text-slate-500" />
          )}
        </div>
      )}
      <span className="text-sm font-medium text-slate-200 line-clamp-2">
        {item.name}
      </span>
      {isService && serviceItem && (
        <span className="text-xs text-slate-400">
          {serviceItem.durationMinutes}min
        </span>
      )}
      <span className="text-xs font-semibold text-orange-400">
        R$ {item.price.toFixed(2)}
      </span>
    </motion.button>
  );
}