// src/features/sales/types.ts
import type { ProductItem } from './server/listProducts';
import type { PaymentMethodItem } from './server/listPaymentMethods';
import type { SaleDraftResult } from './server/getSaleDraft';

export type { ProductItem, PaymentMethodItem, SaleDraftResult };
export type { ServiceForSaleItem } from './server/listServicesForSale';

export interface CartItem {
  id: string;
  itemType: 'product' | 'service';
  itemId: string | null;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isLocked: boolean;
}

export interface SplitPayment {
  paymentMethodId: string;
  paymentMethodName: string;
  amount: number;
}