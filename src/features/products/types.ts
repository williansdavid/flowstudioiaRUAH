// src/features/products/types.ts
export interface ProductItem {
  id: string;
  name: string;
  price: number;
  avatarUrl: string | null;
  department: string | null;
  isActive: boolean;
  commissionRate: number;
}

export interface ProductFormValues {
  name: string;
  price: number;
  department: string;
  isActive: boolean;
}