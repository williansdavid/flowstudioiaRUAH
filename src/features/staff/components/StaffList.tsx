// src/features/staff/components/StaffList.tsx

import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Pencil,
  Plus,
  Mail,
  Phone,
  CalendarCheck2,
  CalendarX2,
  CalendarRange,
  AlertCircle,
  Users,
  Send,
} from 'lucide-react';
import { staffColor } from '../../appointments/components/DayCalendar/staffColor';
import { useStaffList, useResendStaffInvite } from '../hooks';
import type { StaffListItem } from '../types';


interface StaffListProps {
  onCreate?: () => void;
  onEdit?: (id: string) => void;
}

/** Iniciais do nome para fallback do avatar. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

/** Badge de role do profissional (Admin destaque, Profissional neutro). */
function RoleBadge({ role }: { role: StaffListItem['role'] }) {
  if (!role) return null;
  const isAdmin = role === 'admin';
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none ${
        isAdmin
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      {isAdmin ? 'Admin' : 'Profissional'}
    </span>
  );
}

function Avatar({
  name,
  url,
  color,
}: {
  name: string;
  url: string | null;
  color: string;
}) {
  // onError defensivo: bucket privado / URL quebrada cai pra inicial.
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(url) && !failed;

  return (
    <div
      className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
        // ring-color via boxShadow não — usamos a prop ring com cor custom abaixo.
        // Tailwind ring usa --tw-ring-color; setamos direto.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ['--tw-ring-color' as any]: `color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      {showImg ? (
        <img
          src={url as string}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <span className="text-base font-semibold" style={{ color }}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}

function CreateButton({ onCreate }: { onCreate?: () => void }) {
  if (!onCreate) return null;
  return (
    <button
      type="button"
      onClick={onCreate}
      className="inline-flex items-center gap-2 rounded-button bg-primary px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"

    >
      <Plus className="size-4" />
      Novo profissional
    </button>
  );
}

/** Skeleton de um card durante o loading. */
function StaffCardSkeleton() {
  return (
    <li className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="size-14 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
      <div className="space-y-2 border-t pt-3">
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </li>
  );
}

function StaffCard({
  staff,
  onEdit,
}: {
  staff: StaffListItem;
  onEdit?: (id: string) => void;
}) {
  const color = staffColor(staff.id);
  const resendInvite = useResendStaffInvite();

  // Convite pendente: só relevante p/ quem pode editar e tem e-mail.
  const showPending = staff.canEdit && !staff.hasAccess && Boolean(staff.email);

  return (
    <li
      className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-card p-5 pl-6 shadow-sm transition hover:shadow-md"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-start gap-4">
        <Avatar name={staff.name} url={staff.avatarUrl} color={color} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold leading-tight">{staff.name}</p>
            <RoleBadge role={staff.role} />
          </div>
          {staff.specialty && (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {staff.specialty}
            </p>
          )}


          {/* Linha do badge: status à esquerda, botão Horários à direita */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                staff.isBookable
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {staff.isBookable ? (
                <CalendarCheck2 className="size-3" />
              ) : (
                <CalendarX2 className="size-3" />
              )}
              {staff.isBookable ? 'Agendável' : 'Indisponível'}
            </span>

            <Link
              to="/admin/equipe/$staffId/horarios"
              params={{ staffId: staff.id }}
              aria-label={`Horários de ${staff.name}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <CalendarRange className="size-3.5" />
              Horários
            </Link>
          </div>
        </div>

        {staff.canEdit && onEdit && (
          <button
            type="button"
            onClick={() => onEdit(staff.id)}
            aria-label={`Editar ${staff.name}`}
            className="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Pencil className="size-4" />
          </button>
        )}
      </div>

      {(staff.email || staff.phone || showPending) && (
        <div className="space-y-1.5 border-t pt-3">
          {staff.email && (
            <p className="flex items-center gap-2 truncate text-sm text-muted-foreground">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate">{staff.email}</span>
            </p>
          )}
          {staff.phone && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-3.5 shrink-0" />
              {staff.phone}
            </p>
          )}

          {showPending && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-500">
                <AlertCircle className="size-3.5 shrink-0" />
                Convite pendente
              </span>
              <button
                type="button"
                onClick={() =>
                  resendInvite.mutate({ email: staff.email as string })
                }
                disabled={resendInvite.isPending}
                aria-label={`Reenviar convite para ${staff.name}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-amber-500 dark:hover:bg-amber-950/30"
              >
                <Send className="size-3.5" />
                {resendInvite.isPending ? 'Enviando…' : 'Reenviar'}
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}


export function StaffList({ onCreate, onEdit }: StaffListProps) {
  const { data, isLoading, isError } = useStaffList();

  // Loading.
  if (isLoading) {
    return (
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <StaffCardSkeleton key={i} />
        ))}
      </ul>
    );
  }

  // Error.
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 py-16 text-center">
        <AlertCircle className="mb-3 size-8 text-destructive" />
        <p className="text-sm font-medium">Não foi possível carregar a equipe</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tente recarregar a página em instantes.
        </p>
      </div>
    );
  }

  const items = data ?? [];

  // Empty.
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Users className="mb-3 size-8 text-muted-foreground" />
        <p className="text-sm font-medium">Nenhum profissional cadastrado</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Adicione o primeiro membro da equipe para começar.
        </p>
        {onCreate && (
          <div className="mt-4">
            <CreateButton onCreate={onCreate} />
          </div>
        )}
      </div>
    );
  }

  // Lista.
  return (
    <div className="space-y-4">
      {onCreate && (
        <div className="flex justify-end">
          <CreateButton onCreate={onCreate} />
        </div>
      )}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((staff) => (
          <StaffCard key={staff.id} staff={staff} onEdit={onEdit} />
        ))}
      </ul>
    </div>
  );
}
