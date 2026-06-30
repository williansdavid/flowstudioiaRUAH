// src/features/sales/components/PdvPage.tsx
import { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import {
  useProducts,
  usePaymentMethods,
  useAppointmentSaleData,
  useFinalizeSale,
  useServicesForSale,
} from '../hooks';
import { usePdvStore, persistPdvState, loadPdvState, clearPdvState } from '../stores/pdv-store';
import { ProductGrid } from './ProductGrid';
import { CartPanel } from './CartPanel';
import { CartFloatingFooter } from './CartFloatingFooter';
import { CartModal } from './CartModal';
import { PdvHeader } from './PdvHeader';
import type { ProductItem, CartItem, SplitPayment } from '../types';
import type { ServiceForSaleItem } from '../server/listServicesForSale';
import { useSession } from '@/features/auth/hooks';
import { SplitPaymentSection } from './SplitPayment';


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
  const finalizeSale = useFinalizeSale();

  // Mobile state
  const [cartOpen, setCartOpen] = useState(false);

  // Store
  const status = usePdvStore((s) => s.status);
  const items = usePdvStore((s) => s.items);
  const payments = usePdvStore((s) => s.payments);
  const clientName = usePdvStore((s) => s.clientName);
  const isDirty = usePdvStore((s) => s.isDirty);
  const storeAppointmentId = usePdvStore((s) => s.appointmentId);
  const {
    loadFromAppointment,
    addItem,
    updateQuantity,
    removeItem,
    addPayment,
    removePayment,
    hydrate,
    reset,
    setStatus,
  } = usePdvStore();

  // Hydrate do IndexedDB na montagem
  useEffect(() => {
    if (storeAppointmentId) return;
    loadPdvState().then((saved) => {
      if (saved) {
        hydrate(saved);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Se veio de agendamento e store está vazia, carrega
  useEffect(() => {
    if (!appointmentData) return;
    if (storeAppointmentId === appointmentId) return;
    loadFromAppointment({
      appointmentId: appointmentData.appointmentId,
      clientName: appointmentData.clientName,
      serviceId: appointmentData.serviceId,
      serviceName: appointmentData.serviceName,
      servicePrice: appointmentData.servicePrice,
    });
  }, [appointmentData, appointmentId, storeAppointmentId, loadFromAppointment]);

  // Persiste no IndexedDB quando o carrinho muda
  useEffect(() => {
    if (!isDirty) return;
    const state = usePdvStore.getState();
    const timer = setTimeout(() => {
      persistPdvState({
        status: state.status,
        items: state.items,
        payments: state.payments,
        appointmentId: state.appointmentId,
        clientName: state.clientName,
        isDirty: false,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [items, payments, isDirty]);

  const handleAddProduct = useCallback(
    (product: ProductItem) => {
      addItem({
        id: `product-${product.id}`,
        itemType: 'product',
        itemId: product.id,
        itemName: product.name,
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price,
        isLocked: false,
      });
    },
    [addItem],
  );


  const handleAddService = useCallback(
    (service: ServiceForSaleItem) => {
      addItem({
        id: `service-${service.id}`,
        itemType: 'service',
        itemId: service.id,
        itemName: service.name,
        quantity: 1,
        unitPrice: service.price,
        totalPrice: service.price,
        isLocked: false,
      });
    },
    [addItem],
  );
  const handleIncrement = useCallback((id: string) => updateQuantity(id, 1), [updateQuantity]);
  const handleDecrement = useCallback((id: string) => updateQuantity(id, -1), [updateQuantity]);
  const handleRemove = useCallback((id: string) => removeItem(id), [removeItem]);
  const handleAddPaymentFn = useCallback((payment: SplitPayment) => addPayment(payment), [addPayment]);
  const handleRemovePaymentFn = useCallback((methodId: string) => removePayment(methodId), [removePayment]);

  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  const cashMethod = paymentMethods.find(
  (m) => m.name.toLowerCase() === 'dinheiro',
  );
  const hasCashPayment = cashMethod
    ? payments.some((p) => p.paymentMethodId === cashMethod.id)
    : false;
  const change = hasCashPayment && paid > total ? paid - total : 0;
  const isComplete = change > 0 || Math.abs(total - paid) < 0.01;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  async function handleFinalize() {
    if (items.length === 0) {
      toast.error('Adicione pelo menos um item ao carrinho.');
      return;
    }
    if (!isComplete) {
      toast.error('Complete o pagamento antes de finalizar.');
      return;
    }
    setStatus('processing');
    try {
      await finalizeSale.mutateAsync({
        saleData: {
          saleType: storeAppointmentId ? 'appointment' : 'product',
          appointmentId: storeAppointmentId,
          clientName,
        },
        items: items.map((item) => ({
          itemType: item.itemType,
          itemId: item.itemId,
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          isLocked: item.isLocked,
        })),
        payments: payments.map((p) => ({
          paymentMethodId: p.paymentMethodId,
          amount: p.amount,
        })),
      });
      await clearPdvState();
      reset();
      setCartOpen(false);
    } catch {
      setStatus('payment');
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 sm:pb-6">
      <PdvHeader clientName={clientName} appointmentId={storeAppointmentId ?? undefined} />

      {/* Desktop: grid + cart panel lateral */}
      <div className="hidden lg:grid lg:grid-cols-5 lg:gap-6">
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
            items={items}
            total={total}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onRemove={handleRemove}
            canEdit={canEdit}
          />
          {items.length > 0 && (
            <>
              <SplitPaymentSection
                methods={paymentMethods}
                payments={payments}
                total={total}
                onAddPayment={handleAddPaymentFn}
                onRemovePayment={handleRemovePaymentFn}
              />
              <Button
                onClick={handleFinalize}
                isLoading={status === 'processing'}
                disabled={!isComplete || items.length === 0 || status === 'processing'}
                className="w-full"
                size="lg"
              >
                Finalizar venda — R$ {total.toFixed(2)}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile: grid full + footer + modal */}
      <div className="lg:hidden">
        <ProductGrid
          products={products}
          services={services}
          onAddProduct={handleAddProduct}
          onAddService={handleAddService}
        />
      </div>

{/* Footer flutuante — apenas mobile */}
<div className="lg:hidden">
  <CartFloatingFooter
    itemCount={totalItems}
    total={total}
    onClick={() => setCartOpen(true)}
  />
</div>

      {/* Modal do carrinho (mobile) */}
      <CartModal
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={items}
        total={total}
        payments={payments}
        paymentMethods={paymentMethods}
        isComplete={isComplete}
        isFinalizing={status === 'processing'}
        canEdit={canEdit}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onRemove={handleRemove}
        onAddPayment={handleAddPaymentFn}
        onRemovePayment={handleRemovePaymentFn}
        onFinalize={handleFinalize}
      />
    </div>
  );
}