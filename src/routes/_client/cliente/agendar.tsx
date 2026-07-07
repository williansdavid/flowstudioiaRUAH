import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { ClientBookingWizard } from '@/features/appointments/components/ClientBookingWizard';
import type { ServiceOption, BookableStaffItem } from '@/features/appointments/types';
import { Button } from '@/features/utils/ui/Button';

// ── Server functions ──────────────────────────────────────────

const listActiveServices = createServerFn({ method: 'GET' })
  .handler(async (): Promise<ServiceOption[]> => {
    const supabase = createSupabaseServer();
    const { data, error } = await supabase
      .from('services')
      .select('id, name, duration_minutes, price')
      .eq('is_active', true)
      .order('name');
    if (error) throw new Error('Erro ao carregar serviços.');
    return data.map((s) => ({
      id: s.id,
      name: s.name,
      durationMinutes: s.duration_minutes,
      price: s.price,
    })) as ServiceOption[];
  });

const listBookableStaff = createServerFn({ method: 'GET' })
  .handler(async (): Promise<BookableStaffItem[]> => {
    const supabase = createSupabaseServer();
    const { data, error } = await supabase
      .from('staff')
      .select('id, name, display_order, avatar_url, color')
      .eq('is_bookable', true)
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('name');
    if (error) throw new Error('Erro ao carregar profissionais.');
    return data.map((s) => ({
      id: s.id,
      name: s.name,
      displayOrder: s.display_order ?? 999,
      avatarUrl: s.avatar_url,
      color: s.color,
      isBookable: true,
    }));
  });

const getCurrentClientName = createServerFn({ method: 'GET' })
  .handler(async (): Promise<string> => {
    const supabase = createSupabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Sessão inválida.');

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    return profile?.full_name || user.email?.split('@')[0] || 'Cliente';
  });

// ── Route ─────────────────────────────────────────────────────

export const Route = createFileRoute('/_client/cliente/agendar')({
  component: AgendarPage,
});

function AgendarPage() {
  const servicesQuery = useQuery({
    queryKey: ['services', 'active'],
    queryFn: () => listActiveServices(),
  });

  const staffQuery = useQuery({
    queryKey: ['staff', 'bookable'],
    queryFn: () => listBookableStaff(),
  });

  const clientNameQuery = useQuery({
    queryKey: ['client', 'profile', 'name'],
    queryFn: () => getCurrentClientName(),
  });

  // Loading
  if (servicesQuery.isPending || staffQuery.isPending || clientNameQuery.isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  // Error
  if (servicesQuery.isError || staffQuery.isError || clientNameQuery.isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {servicesQuery.error?.message ||
            staffQuery.error?.message ||
            clientNameQuery.error?.message}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            servicesQuery.refetch();
            staffQuery.refetch();
            clientNameQuery.refetch();
          }}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <ClientBookingWizard
        services={servicesQuery.data}
        staff={staffQuery.data}
        clientName={clientNameQuery.data}
      />
    </div>
  );
}