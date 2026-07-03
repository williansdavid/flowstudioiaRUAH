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
  Archive,
  ArchiveRestore,
} from 'lucide-react';
import { toast } from 'sonner';
import { staffColor } from '../../appointments/components/DayCalendar/staffColor';
import { WhatsAppButton } from '@/features/utils/whats/WhatsAppButton';
import { toWhatsAppHref } from '@/features/utils/whats/whatsapp';
import { useStaffList, useResendStaffInvite, useArchiveStaff } from '../hooks';
import type { StaffListItem } from '../types';
import { Button } from '@/features/utils/ui/Button';

interface StaffListProps {
  onCreate?: () => void;
  onEdit?: (id: string) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '').replace(/^55/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
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
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(url) && !failed;

  return (
    <div
      className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
        boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 30%, transparent)`,
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

function StaffCardSkeleton() {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-slate-700/20 bg-slate-800/40 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="size-14 shrink-0 animate-pulse rounded-full bg-slate-700/30" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-700/30" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-700/30" />
          <div className="h-5 w-24 animate-pulse rounded-full bg-slate-700/30" />
        </div>
      </div>
      <div className="space-y-2 border-t border-slate-700/20 pt-3">
        <div className="h-3 w-3/4 animate-pulse rounded bg-slate-700/30" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-700/30" />
      </div>
    </li>
  );
}

function StaffCard({
  staff,
  onEdit,
  onArchive,
  archivePending,
}: {
  staff: StaffListItem;
  onEdit?: (id: string) => void;
  onArchive: (id: string, name: string, archive: boolean) => void;
  archivePending: boolean;
}) {
  const color = staff.color ?? staffColor(staff.id);
  const resendInvite = useResendStaffInvite();
  const isAdmin = staff.role === 'admin';
  const showPending = staff.canEdit && !staff.hasAccess && Boolean(staff.email);
  const whatsappHref = staff.phone ? toWhatsAppHref(staff.phone) : null;

  return (
    <li
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-700/20 bg-slate-800/40 p-5 pl-6 shadow-sm transition hover:border-orange-500/30"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-start gap-4">
        <Avatar name={staff.name} url={staff.avatarUrl} color={color} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-100">{staff.name}</p>
          {staff.specialty && (
            <p className="mt-0.5 truncate text-sm text-slate-500">
              {staff.specialty}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between gap-2">
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none ${
                staff.isBookable
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {staff.isBookable ? (
                <CalendarCheck2 className="size-3" />
              ) : (
                <CalendarX2 className="size-3.5" />
              )}
              {staff.isBookable ? 'Agendável' : 'Indisponível'}
            </span>

            {!staff.isArchived && staff.isActive && (
              <Link
                to="/admin/equipe/$staffId/horarios"
                params={{ staffId: staff.id }}
                aria-label={`Horários de ${staff.name}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-orange-500/25 bg-orange-500/8 px-2.5 py-1 text-xs font-semibold text-orange-400 transition hover:bg-orange-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
              >
                <CalendarRange className="size-3.5" />
                Horários
              </Link>
            )}
{!staff.isActive && (
  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold leading-none text-red-400 ring-1 ring-red-500/30">
    <AlertCircle className="size-3.5" />
    Inativo
  </span>
)}          
          </div>
        </div>

        {staff.canEdit && (
          <div className="flex shrink-0 items-center gap-1">
            {onEdit && !staff.isArchived && (
              <button
                type="button"
                onClick={() => onEdit(staff.id)}
                aria-label={`Editar ${staff.name}`}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-700/30 hover:text-slate-200 focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Pencil className="size-4" />
              </button>
            )}
            {staff.isArchived ? (
              <button
                type="button"
                disabled={archivePending}
                onClick={() => onArchive(staff.id, staff.name, false)}
                aria-label={`Reativar ${staff.name}`}
                className="inline-flex items-center gap-1.5 rounded-lg p-2 text-emerald-400 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArchiveRestore className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={archivePending}
                onClick={() => onArchive(staff.id, staff.name, true)}
                aria-label={`Arquivar ${staff.name}`}
                className="inline-flex items-center gap-1.5 rounded-lg p-2 text-red-400 transition hover:bg-red-500/10 focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Archive className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {(isAdmin || staff.email || staff.phone || showPending) && (
        <div className="space-y-1.5 border-t border-slate-700/20 pt-3">
          {isAdmin && (
            <span className="inline-flex shrink-0 items-center rounded-full bg-orange-500/10 px-2 py-0.5 text-[11px] font-semibold leading-none text-orange-400">
              Admin
            </span>
          )}
          {staff.email && (
            <p className="flex items-center gap-2 truncate text-sm text-slate-500">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate">{staff.email}</span>
            </p>
          )}
          {staff.phone && (
            <p className="flex items-center justify-between gap-2 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <Phone className="size-3.5 shrink-0" />
                {formatPhone(staff.phone)}
              </span>
              <WhatsAppButton href={whatsappHref} />
            </p>
          )}
          {showPending && !staff.isArchived && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
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
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700/30 px-2.5 py-1 text-xs font-medium text-amber-400 transition hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60"
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
  const [showArchived, setShowArchived] = useState(false);
  const { data: staff, isLoading, isError } = useStaffList(showArchived);
  const archiveMut = useArchiveStaff();

  async function handleArchive(id: string, name: string, archive: boolean) {
    try {
      await archiveMut.mutateAsync({ id, archive });
      toast.success(
        archive ? `${name} foi arquivado.` : `${name} foi reativado.`,
      );
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Falha ao atualizar profissional.',
      );
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Conteúdo scrollável */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {/* Header — desktop only */}
          <div className="hidden sm:flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowArchived((v) => !v)}
            >
              <Archive className="size-4" />
              {showArchived ? 'Ver ativos' : 'Ver arquivados'}
            </Button>
            {!showArchived && onCreate && (
              <Button variant="primary" size="sm" onClick={onCreate}>
                <Plus className="size-4" />
                Novo profissional
              </Button>
            )}
          </div>

          {isLoading && (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <StaffCardSkeleton key={i} />
              ))}
            </ul>
          )}

          {isError && !isLoading && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
              <AlertCircle className="size-4 shrink-0" />
              Falha ao carregar profissionais.
            </div>
          )}

          {!isLoading && !isError && (staff?.length ?? 0) === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-700/30 bg-slate-800/30 p-10 text-center">
              <Users className="size-8 text-slate-600" />
              <p className="text-sm text-slate-500">
                {showArchived
                  ? 'Nenhum profissional arquivado.'
                  : 'Nenhum profissional cadastrado.'}
              </p>
              {!showArchived && onCreate && (
                <Button variant="primary" size="sm" onClick={onCreate}>
                  <Plus className="size-4" />
                  Novo profissional
                </Button>
              )}
            </div>
          )}

          {!isLoading && !isError && (staff?.length ?? 0) > 0 && (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {staff!.map((s) => (
                <StaffCard
                  key={s.id}
                  staff={s}
                  onEdit={onEdit}
                  onArchive={handleArchive}
                  archivePending={archiveMut.isPending}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer mobile — efeito vidro de verdade */}
      <div className="flex-shrink-0 sm:hidden px-3 pb-4 pt-3 border-t border-white/5 bg-black/20 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowArchived((v) => !v)}
          >
            <Archive className="size-4" />
            {showArchived ? 'Ativos' : 'Arquivados'}
          </Button>
          {onCreate && (
            <Button variant="primary" size="sm" onClick={onCreate}>
              <Plus className="size-4" />
              Novo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}