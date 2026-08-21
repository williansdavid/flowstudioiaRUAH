// src/features/sales/stores/pdv-store.ts
import { create } from 'zustand';
import { openDB, type IDBPDatabase } from 'idb';
import type { CartItem, SplitPayment } from '../types';

// ── Tipos ────────────────────────────────────────────────────────
export type PdvStatus = 'empty' | 'editing' | 'payment' | 'processing' | 'completed';

/** Item de serviço vindo do agendamento (multi-serviço) */
export interface AppointmentSaleServiceItem {
  serviceId: string;
  serviceName: string;
  price: number;
  quantity: number;
}

export interface PdvState {
  status: PdvStatus;
  items: CartItem[];
  payments: SplitPayment[];
  appointmentId: string | null;
  clientName: string;
  isDirty: boolean;
}

interface PdvActions {
  loadFromAppointment: (data: {
    appointmentId: string;
    clientName: string;
    serviceId: string | null; // null em multi-serviço
    serviceName: string;
    servicePrice: number;
    services?: AppointmentSaleServiceItem[]; // lista real (multi)
  }) => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  addPayment: (payment: SplitPayment) => void;
  removePayment: (paymentMethodId: string) => void;
  setStatus: (status: PdvStatus) => void;
  setClientName: (name: string) => void;
  hydrate: (saved: PdvState | null) => void;
  reset: () => void;
}

const initialState: PdvState = {
  status: 'empty',
  items: [],
  payments: [],
  appointmentId: null,
  clientName: 'Cliente Avulso',
  isDirty: false,
};

// ── Store ─────────────────────────────────────────────────────────
export const usePdvStore = create<PdvState & PdvActions>((set, get) => ({
  ...initialState,

  loadFromAppointment: (data) => {
    // Multi-serviço: 1 item de carrinho por serviço (corte + barba = 2 itens)
    const services = data.services ?? [];
    const hasMulti = services.length > 0;

    const items: CartItem[] = hasMulti
      ? services.map((svc) => ({
          id: `service-${svc.serviceId}`,
          itemType: 'service' as const,
          itemId: svc.serviceId,
          itemName: svc.serviceName,
          quantity: svc.quantity ?? 1,
          unitPrice: svc.price,
          totalPrice: (svc.price ?? 0) * (svc.quantity ?? 1),
          isLocked: true,
        }))
      : // Fallback legado: 1 serviço único
        [
          {
            id: `service-${data.serviceName}`,
            itemType: 'service' as const,
            itemId: data.serviceId ?? '',
            itemName: data.serviceName,
            quantity: 1,
            unitPrice: data.servicePrice,
            totalPrice: data.servicePrice,
            isLocked: true,
          },
        ];

    set({
      status: 'editing',
      appointmentId: data.appointmentId,
      clientName: data.clientName,
      items,
      payments: [],
      isDirty: true,
    });
  },

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.itemType === item.itemType && i.itemId === item.itemId,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === existing.id
              ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.unitPrice }
              : i,
          ),
          payments: [],      // ← limpa pagamentos
          isDirty: true,
          status: state.status === 'empty' ? 'editing' : state.status,
        };
      }
      return {
        items: [...state.items, item],
        payments: [],        // ← limpa pagamentos
        isDirty: true,
        status: state.status === 'empty' ? 'editing' : state.status,
      };
    }),

  updateQuantity: (id, delta) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id && item.quantity + delta >= 1
          ? { ...item, quantity: item.quantity + delta, totalPrice: (item.quantity + delta) * item.unitPrice }
          : item,
      ),
      payments: [],          // ← limpa pagamentos
      isDirty: true,
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => !item.isLocked && item.id !== id),
      payments: [],          // ← limpa pagamentos
      isDirty: true,
    })),

  addPayment: (payment) =>
    set((state) => ({
      payments: [...state.payments, payment],
      isDirty: true,
      status: 'payment',
    })),

  removePayment: (paymentMethodId) =>
    set((state) => ({
      payments: state.payments.filter((p) => p.paymentMethodId !== paymentMethodId),
      isDirty: true,
    })),

  setStatus: (status) => set({ status }),
  setClientName: (name) => set({ clientName: name }),

  hydrate: (saved) => {
    if (saved && saved.items.length > 0) {
      set({ ...saved, isDirty: false });
    }
  },

  reset: () => set({ ...initialState }),
}));

// ── IndexedDB persistence ────────────────────────────────────────
const DB_NAME = 'flowstudio-pdv';
const DB_VERSION = 1;
const STORE_NAME = 'cart';
let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function persistPdvState(state: PdvState): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const db = await getDb();
    await db.put(STORE_NAME, state, 'current');
  } catch (err) {
    console.error('[PDV] Erro ao persistir no IndexedDB:', err);
  }
}

export async function loadPdvState(): Promise<PdvState | null> {
  if (typeof window === 'undefined') return null;
  try {
    const db = await getDb();
    const saved = await db.get(STORE_NAME, 'current');
    return saved ?? null;
  } catch (err) {
    console.error('[PDV] Erro ao carregar do IndexedDB:', err);
    return null;
  }
}

export async function clearPdvState(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const db = await getDb();
    await db.delete(STORE_NAME, 'current');
  } catch (err) {
    console.error('[PDV] Erro ao limpar IndexedDB:', err);
  }
}