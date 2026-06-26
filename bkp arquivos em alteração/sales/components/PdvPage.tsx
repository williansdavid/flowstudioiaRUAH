// src\features\sales\components\PdvPage.tx
import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import {
  useProducts,
  usePaymentMethods,
  useAppointmentSaleData,
  useCreateSaleDraft,
  useFinalizeSale,
  useSaleDraft,
  useServicesForSale,
  useUpdateSaleDraft,
  useDeleteSaleDraft,
} from '../hooks';
import { ProductGrid } from './ProductGrid';
import { CartPanel } from './CartPanel';
import { SplitPaymentSection } from './SplitPayment';
import { PdvHeader } from './PdvHeader';
import type { ProductItem, CartItem, SplitPayment } from '../types';
import type { ServiceForSaleItem } from '../server/listServicesForSale';
import { useSession } from '@/features/auth/hooks';

export function PdvPage() {
  const search = useSearch({ from: '/_authed/admin/pdv' });
  const appointmentId = (search as { appointmentId?: string }).appointmentId;
  const navigate = useNavigate();
  const { data: session } = useSession();
  const canEdit = session?.profile.role === 'admin';

  const { data: appointmentData } = useAppointmentSaleData(appointmentId);
  const { data: products = [] } = useProducts();
  const { data: services = [] } = useServicesForSale();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const { data: existingDraft, isLoading: draftLoading } = useSaleDraft();
  const createDraft = useCreateSaleDraft();
  const updateDraft = useUpdateSaleDraft();
  const deleteDraft = useDeleteSaleDraft();
  const finalizeSale = useFinalizeSale();

  const clientName = appointmentData?.clientName ?? 'Cliente Avulso';

  // Estado do carrinho e pagamentos
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [payments, setPayments] = useState<SplitPayment[]>([]);
  const [saleDraftId, setSaleDraftId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Inicializa: carrega rascunho existente OU cria estado inicial do agendamento
  useEffect(() => {
    if (isInitialized || draftLoading) return;

    if (existingDraft) {
      setCartItems(
        existingDraft.items.map((i) => ({
          id: `${i.itemType}-${i.itemId ?? i.itemName}`,
          itemType: i.itemType,
          itemId: i.itemId,
          itemName: i.itemName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
          isLocked: i.isLocked,
        })),
      );
      setPayments(
        existingDraft.payments.map((p) => ({
          paymentMethodId: p.paymentMethodId,
          paymentMethodName: '',
          amount: p.amount,
        })),
      );
      setSaleDraftId(existingDraft.id);
      setIsInitialized(true);
      } else if (appointmentData) {
        const initialItems: CartItem[] = [
          {
            id: `service-${appointmentData.serviceName}`,
            itemType: 'service',
            itemId: appointmentData.serviceId,
            itemName: appointmentData.serviceName,
            quantity: 1,
            unitPrice: appointmentData.servicePrice,
            totalPrice: appointmentData.servicePrice,
            isLocked: true,
          },
        ];
        setCartItems(initialItems);
        saveDraft(initialItems, saleDraftId);  // ← ADICIONADO
        setIsInitialized(true);
      }
  }, [existingDraft, draftLoading, appointmentData, appointmentId, isInitialized]);

  // Salva rascunho no banco a cada alteração (com debounce)
  const saveDraft = useCallback(
    (items: CartItem[], saleId: string | null) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        if (items.length === 0) {
          if (saleId) {
            try {
              await deleteDraft.mutateAsync({ saleId });
              setSaleDraftId(null);
            } catch {
              // toast já tratado no hook
            }
          }
          return;
        }

        try {
          if (saleId) {
            await updateDraft.mutateAsync({
              saleId,
              clientName,
              items: items.map((item) => ({
                itemType: item.itemType,
                itemId: item.itemId,
                itemName: item.itemName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                isLocked: item.isLocked,
              })),
            });
          } else {
            const result = await createDraft.mutateAsync({
              appointmentId,
              clientName,
              items: items.map((item) => ({
                itemType: item.itemType,
                itemId: item.itemId,
                itemName: item.itemName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                isLocked: item.isLocked,
              })),
            });
            setSaleDraftId(result.id);
          }
        } catch {
          // toast já tratado nos hooks
        }
      }, 1000);
    },
    [appointmentId, clientName, createDraft, updateDraft, deleteDraft],
  );

  const handleAddProduct = useCallback(
    (product: ProductItem) => {
      setCartItems((prev) => {
        const existing = prev.find(
          (item) => item.itemType === 'product' && item.itemId === product.id,
        );
        let newItems: CartItem[];
        if (existing) {
          newItems = prev.map((item) =>
            item.id === existing.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  totalPrice: (item.quantity + 1) * item.unitPrice,
                }
              : item,
          );
        } else {
          newItems = [
            ...prev,
            {
              id: `product-${product.id}`,
              itemType: 'product',
              itemId: product.id,
              itemName: product.name,
              quantity: 1,
              unitPrice: product.price,
              totalPrice: product.price,
              isLocked: false,
            },
          ];
        }
        saveDraft(newItems, saleDraftId);
        return newItems;
      });
    },
    [saleDraftId, saveDraft],
  );

  const handleAddService = useCallback(
    (service: ServiceForSaleItem) => {
      setCartItems((prev) => {
        const existing = prev.find(
          (item) => item.itemType === 'service' && item.itemId === service.id,
        );
        let newItems: CartItem[];
        if (existing) {
          newItems = prev.map((item) =>
            item.id === existing.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  totalPrice: (item.quantity + 1) * item.unitPrice,
                }
              : item,
          );
        } else {
          newItems = [
            ...prev,
            {
              id: `service-${service.id}`,
              itemType: 'service',
              itemId: service.id,
              itemName: service.name,
              quantity: 1,
              unitPrice: service.price,
              totalPrice: service.price,
              isLocked: false,
            },
          ];
        }
        saveDraft(newItems, saleDraftId);
        return newItems;
      });
    },
    [saleDraftId, saveDraft],
  );

  const handleIncrement = useCallback(
    (id: string) => {
      setCartItems((prev) => {
        const newItems = prev.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity + 1,
                totalPrice: (item.quantity + 1) * item.unitPrice,
              }
            : item,
        );
        saveDraft(newItems, saleDraftId);
        return newItems;
      });
    },
    [saleDraftId, saveDraft],
  );

  const handleDecrement = useCallback(
    (id: string) => {
      setCartItems((prev) => {
        const newItems = prev.map((item) =>
          item.id === id && item.quantity > 1
            ? {
                ...item,
                quantity: item.quantity - 1,
                totalPrice: (item.quantity - 1) * item.unitPrice,
              }
            : item,
        );
        saveDraft(newItems, saleDraftId);
        return newItems;
      });
    },
    [saleDraftId, saveDraft],
  );

  const handleRemove = useCallback(
    (id: string) => {
      setCartItems((prev) => {
        const newItems = prev.filter((item) => !item.isLocked && item.id !== id);
        saveDraft(newItems, saleDraftId);
        return newItems;
      });
    },
    [saleDraftId, saveDraft],
  );

  const handleAddPayment = useCallback((payment: SplitPayment) => {
    setPayments((prev) => [...prev, payment]);
  }, []);

  const handleRemovePayment = useCallback((paymentMethodId: string) => {
    setPayments((prev) => prev.filter((p) => p.paymentMethodId !== paymentMethodId));
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  const isComplete = Math.abs(total - paid) < 0.01;

  async function handleFinalize() {
    if (cartItems.length === 0) {
      toast.error('Adicione pelo menos um item ao carrinho.');
      return;
    }
    if (!isComplete) {
      toast.error('Complete o pagamento antes de finalizar.');
      return;
    }

    try {
      let saleId = saleDraftId;
      if (!saleId) {
        const result = await createDraft.mutateAsync({
          appointmentId,
          clientName,
          items: cartItems.map((item) => ({
            itemType: item.itemType,
            itemId: item.itemId,
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            isLocked: item.isLocked,
          })),
        });
        saleId = result.id;
      }
      if (!saleId) {
        toast.error('Erro ao criar rascunho.');
        return;
      }
      await finalizeSale.mutateAsync({
        saleId,
        payments: payments.map((p) => ({
          paymentMethodId: p.paymentMethodId,
          amount: p.amount,
        })),
      });
    } catch {
      // toast já tratado nos hooks
    }
  }

  if (draftLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <PdvHeader clientName={clientName} appointmentId={appointmentId} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ProductGrid
            products={products}
            services={services}
            onAddProduct={handleAddProduct}
            onAddService={handleAddService}
          />
        </div>
        <div className="space-y-6 lg:col-span-2">
          <CartPanel
            items={cartItems}
            total={total}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onRemove={handleRemove}
            canEdit={canEdit}
          />
          {cartItems.length > 0 && (
            <>
              <SplitPaymentSection
                methods={paymentMethods}
                payments={payments}
                total={total}
                onAddPayment={handleAddPayment}
                onRemovePayment={handleRemovePayment}
              />
              <Button
                onClick={handleFinalize}
                isLoading={finalizeSale.isPending}
                disabled={!isComplete || cartItems.length === 0}
                className="w-full"
                size="lg"
              >
                Finalizar venda — R$ {total.toFixed(2)}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}