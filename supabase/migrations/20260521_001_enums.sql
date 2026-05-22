-- =====================================================
-- ENUMS: tipos fortes para roles, status e categorias
-- =====================================================

create type public.user_role as enum ('admin', 'staff', 'client');

create type public.appointment_status as enum (
  'pending',     -- aguardando confirmação
  'confirmed',   -- confirmado
  'completed',   -- realizado
  'cancelled',   -- cancelado
  'no_show'      -- cliente faltou
);

create type public.transaction_type as enum ('income', 'expense');

create type public.transaction_category as enum (
  'service',
  'product',
  'commission',
  'rent',
  'utilities',
  'supplies',
  'marketing',
  'salary',
  'other'
);

create type public.lead_source as enum (
  'landing',
  'whatsapp',
  'instagram',
  'referral',
  'other'
);

create type public.lead_status as enum (
  'new',
  'contacted',
  'scheduled',
  'converted',
  'lost'
);
