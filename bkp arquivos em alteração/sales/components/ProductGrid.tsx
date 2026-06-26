// src/features/sales/components/ProductGrid.tsx
import { Search } from 'lucide-react';
import { useState } from 'react';
import type { ProductItem } from '../types';
import type { ServiceForSaleItem } from '../server/listServicesForSale';
import { ProductCard } from './ProductCard';

type CatalogTab = 'products' | 'services';

interface ProductGridProps {
  products: ProductItem[];
  services: ServiceForSaleItem[];
  onAddProduct: (product: ProductItem) => void;
  onAddService: (service: ServiceForSaleItem) => void;
}

export function ProductGrid({ products, services, onAddProduct, onAddService }: ProductGridProps) {
  const [tab, setTab] = useState<CatalogTab>('products');
  const [search, setSearch] = useState('');

  const currentItems = tab === 'products' ? products : services;
  const filtered = search
    ? currentItems.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      )
    : currentItems;

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={tab === 'products' ? 'Buscar produto...' : 'Buscar serviço...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-700/20 bg-slate-800/60 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-orange-500/40"
        />
      </div>

      {/* Abas */}
      <div className="flex gap-1 rounded-lg bg-slate-800/40 p-1">
        <button
          onClick={() => { setTab('products'); setSearch(''); }}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'products'
              ? 'bg-orange-500 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Produtos
        </button>
        <button
          onClick={() => { setTab('services'); setSearch(''); }}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'services'
              ? 'bg-orange-500 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Serviços
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((item) => (
          <ProductCard
            key={`${tab}-${item.id}`}
            item={item}
            type={tab === 'products' ? 'product' : 'service'}
            onAdd={(item: any) => {
            if (tab === 'products') {
              onAddProduct(item as ProductItem);
            } else {
              onAddService(item as ServiceForSaleItem);
            }
          }}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-slate-500">
          Nenhum {tab === 'products' ? 'produto' : 'serviço'} encontrado.
        </p>
      )}
    </div>
  );
}