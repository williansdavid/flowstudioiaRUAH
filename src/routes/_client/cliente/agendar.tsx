import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { BookingWizard } from '@/features/appointments/components/BookingWizard/BookingWizard';
import type { ServiceOption, BookableStaffItem } from '@/features/appointments/types';
import { Button } from '@/features/utils/ui/Button';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

// ── Server functions ──────────────────────────────────────────

const listActiveServices = createServerFn({ method: 'GET' })
  .handler(async (): Promise<ServiceOption[]> => {
    const supabase = createSupabaseAdmin();
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
    const supabase = createSupabaseAdmin();
    // 1. Busca staffs + profile_id
    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name, display_order, color, profile_id')
      .eq('is_bookable', true)
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('full_name');
    if (error) throw new Error('Erro ao carregar profissionais.');

    // 2. Busca profiles dos profissionais
    const profileIds = (data as any[]).map((s) => s.profile_id).filter(Boolean) as string[];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, avatar_url')
      .in('id', profileIds);

    // 3. Map profile_id → avatar_url
    const profileMap = new Map<string, string | null>(
      (profiles as any[])?.map((p) => [p.id, p.avatar_url ?? null]) ?? [],
    );

    // 4. Merge manual
    return (data as any[]).map((s) => ({
      id: s.id,
      name: s.full_name,
      displayOrder: s.display_order ?? 999,
      avatarUrl: profileMap.get(s.profile_id) ?? null,
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
    <div className="mx-auto max-w-6xl px-4 py-4 sm:py-8">
      <BookingWizard
        services={servicesQuery.data}
        staff={staffQuery.data}
        mode="client"
        clientName={clientNameQuery.data}
      />
    </div>
  );
}