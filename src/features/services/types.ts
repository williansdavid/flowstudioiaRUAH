// src/features/services/types.ts
export interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  durationMinutes: number;
  price: number;
  displayOrder: number;
  isActive: boolean;
}

export interface ServiceFormValues {
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}
